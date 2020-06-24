class BoggleGame {
	constructor(boardId, time = 60) {
		this.board = $(`#${boardId}`) //<-- create ID for the game(board)
		this.word_list = new Set() //<-- create set so store UNIQUE values
		this.score = 0 //<-- assign initial score to 0
		this.time = time //<-- dynamic timer for game
		this.setTimer() //<-- run the timer

		// bind the handleSubmit function to the class
		$('#form', this.board).on('submit', this.handleSubmit.bind(this))
	}

	// HANDLE SUBMIT/CLICK EVENTS
	async handleSubmit(e) {
		e.preventDefault() //<-- prevents the page from refreshing on submit
		let selectedWord = $('#word').val() //<--retrieve value from input

		if (!selectedWord) return //<-- if no input, return

		// CHECK IF WORD IS ALREADY PRESENT IN THE LIST USING SET
		if (this.word_list.has(selectedWord)) {
			this.showMessage(`${selectedWord} has already been found`, 'fail')
			return
		}

		// CHECK SERVER IF WORD EXISTS AND DISPLAYS MSG ACCORDINGLY
		const response = await axios.get('/check-answer', { params: { word: selectedWord } })
		if (response.data.result === 'not-word') {
			this.showMessage(`${selectedWord} is not a valid English word`, 'fail')
		} else if (response.data.result === 'not-on-board') {
			this.showMessage(`${selectedWord} is not a valid word on this board`, 'fail')
		} else {
			this.showMessage(`Added: ${selectedWord}`, 'add') //<-- displays msg in DOM
			this.score = this.score + selectedWord.length //<-- increments score by word length
			this.word_list.add(selectedWord) //<-- adds word to set making sure it's unique
			this.populateList(selectedWord) //<-- adds the word to the list item
			this.showScore() //<-- displays score on the DOM
		}
		$('#word').val('').focus() //<-- clears input field and focuses after submitting word
	}

	// APPENDS WORDS TO THE LIST
	populateList(word) {
		$('.list', this.board).append($(`<li>${word}</li>`))
	}
	// DISPLAYS MESSAGE TO USER ON THE DOM
	showMessage(msg, cls) {
		$('.message', this.board).text(msg).removeClass().addClass(`message ${cls}`)
	}
	// DISPLAYS SCORE TO USER ON THE DOM
	showScore() {
		$('.score', this.board).text(this.score)
	}
	// DISPLAYS TIMER TO THE USER ON THE DOM
	showTimer() {
		$('#timer').text(this.time)
	}

	// SETS THE GAME TIMER
	setTimer() {
		$('.btn', this.board).hide() //<-- Hides play again button
		let timerId = setInterval(() => {
			this.time = this.time - 1 //<-- Decrements time by 1 second
			this.showTimer() //<-- display timer decrementing
			if (this.time <= 0) {
				clearInterval(timerId)
				this.showScore()
				this.endGame()
			}
		}, 1000)
	}

	// END OF GAME FUNCTION
	async endGame() {
		$('#form', this.board).hide() //<-- Hides the form
		$('.list', this.board).hide() //<-- Hides the word list
		$('.btn', this.board).show() //<-- Shows the play again button
		const response = await axios.post('/get-score', { score: this.score })
		if (response.data.topScore) {
			this.showMessage(`New High Score: ${this.score}`, 'new')
		} else {
			this.showMessage(`Final Score: ${this.score}`, 'pass')
		}
	}
}

let game = new BoggleGame('boggle')
