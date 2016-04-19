var app = angular.module('app', [])

app.controller('MainController', function($scope) {
  var game = new Game({
    size: 16
  , bombs: 16
  })

  $scope.table = game.table.body

  $scope.open = function(cell) {
    if (game.playing())
      cell.open()
  }
})




var Game = function(options) { var clicked = false , $playing = true

  this.bombs = []

  void(function constructor(self) {
    self.options = {
      size: options.size || 8
    , bombs: options.bombs || 4
    }

    self.table = new Table(self)
  })(this)

  this.playing = function() {
    return $playing
  }

  this.start = function() {
    var $prevStatus = clicked

    clicked = true

    return !$prevStatus
  }

  this.gameOver = function() {
    var i

    $playing = false

    for (i = 0; i < this.bombs.length; i++) {
      this.bombs[i].open()
    }

    alert('Game Over!')
  }

  this.distributeBombs = function(cell) {
    var i, x, y, bomb

    for (i = 0; i < this.options.bombs; i++) {
      do {
        x = Math.ceil(Math.random() * (this.options.size - 1))
        y = Math.ceil(Math.random() * (this.options.size - 1))
        bomb = this.table.body[y][x]
      } while (
        (cell.position.x == x && cell.position.y == y)
        || bomb.isBomb()
      )

      bomb.setBomb()
      this.bombs.push(bomb)
    }
  }

  this.revealEmptyArea = function(target) {
    var x, y, cell

    this.value = -1

    for (x = -1; x < 2; x++) {
      for (y = -1; y < 2; y++) {
        cell = this.table.body[target.position.y + y]
        cell = cell ? cell[target.position.x + x] : undefined

        if (!cell)
          break

        if (cell.empty())
          cell.open()
      }
    }
  }

  return this
}







var Table = function(game) {
  this.body = []

  void(function constructor(self) {
    var x, y

    for (y = 0; y < game.options.size; y++) {
      self.body[y] = []

      for (x = 0; x < game.options.size; x++) {
        self.body[y][x] = new Cell(game, {x: x, y: y})
      }
    }
  })(this)

  return this
}






var Cell = function(game, position) {
  var $open = false

  this.value = 0

  void(function constructor(self) {
    self.position = { x: position.x, y: position.y }
  })(this)

  this.setBomb = function() {
    var x, y, cell

    this.value = -1

    for (x = -1; x < 2; x++) {
      for (y = -1; y < 2; y++) {
        cell = game.table.body[this.position.y + y]
        cell = cell ? cell[this.position.x + x] : undefined

        if (!cell)
          break

        cell.bombAround()
      }
    }
  }

  this.bombAround = function() {
    if (!this.isBomb())
      this.value++
  }

  this.isBomb = function() {
    return this.value == -1
  }

  this.isOpen = function() {
    return $open
  }

  this.open = function() {
    if (this.isOpen())
      return

    $open = true


    if (!game.playing())
      return

    if (game.start()) {
      game.distributeBombs(this)
      game.revealEmptyArea(this)

      return
    }

    if (this.empty())
      return game.revealEmptyArea(this)

    if (this.isBomb())
      return game.gameOver()
  }

  this.fourthPartPosition = function() {
    var fourth = game.options.size / 2
      , x = Math.ceil((this.position.x + 1) / fourth) - 1 || -1
      , y = Math.ceil((this.position.y + 1) / fourth) - 1 || -1

    return { x: ~~x, y: ~~y }
  }

  this.empty = function() {
    return this.value === 0
  }

  return this
}
