const $list = $('.list') //<-- create list element
const $form = $('#form') //<-- get form element from html
const $timer = $('#timer') //<-- assign timer variable
const word_list = new Set() //<-- create set so store UNIQUE values
let score = 0 //<-- assign intial score as 0

$form.on('submit', handleSubmit) //<-- starts game
timer(60) //<-- begins timer of 60 seconds

// HANDLES FORM SUBMISSION
async function handleSubmit(e) {
	e.preventDefault()
	const $word = $('#word') //<-- create variable for input
	let selectedWord = $word.val() //<-- retrieve value from input and save to var

	if (!selectedWord) return

	// CHECK IS WORD IS ALREADY PRESENT IN THE LIST USING SET
	if (word_list.has(selectedWord)) {
		showMessage(`${selectedWord} has already been found`, 'fail')
		$word.val('').focus()
		return
	}

	// CHECK SERVER IF THE WORD EXISTS AND SHOW MSG AND APPLY CLS
	const response = await axios.get('/check-answer', {
		params: { word: selectedWord },
	})
	if (response.data.result === 'not-word') {
		showMessage(`${selectedWord} is not a valid English word`, 'fail')
	} else if (response.data.result === 'not-on-board') {
		showMessage(`${selectedWord} is not a valid word on this board`, 'fail')
	} else {
		populateList(selectedWord) //<-- adds the word to the list item
		score = score + selectedWord.length //<-- increments score by length of word
		showScore() //<-- displays score
		word_list.add(selectedWord) //<-- adds word to set making sure it's unique
		showMessage(`Added: ${selectedWord}`, 'add') //<-- displays message
	}
	$word.val('').focus() //<-- clears input field after submitting word
}

// APPENDING WORDS TO A LIST
function populateList(word) {
	$list.append($('<li>', { text: word }))
}

// SHOWING MESSAGES ON BROWSER
function showMessage(msg, cls) {
	$('.message').text(msg).removeClass().addClass(`message ${cls}`)
}

// DISPLAY GAME TIMER
function showTimer(time) {
	$timer.text(time)
}

// GAME TIMER
async function timer(time = 60) {
	$('.btn').hide()
	const id = setInterval(() => {
		time -= 1
		showTimer(time)
		if (time === 0) {
			clearInterval(id)
			finalScore()
		}
	}, 1000)
}

// CALCULATING INCREMENTING SCORE
function showScore() {
	$('.score').text(score)
}

// CALCULATING FINAL SCORE
async function finalScore() {
	$('.btn').show() //<-- displays play again btn on DOM
	$('#form').hide() //<-- hides form when game over
	$('.list').hide() //<-- hides list when game over
	const response = await axios.post('/get-score', { score: score })
	if (response.data.topScore) {
		showMessage(`New High Score: ${score}`, 'new')
	} else {
		showMessage(`Final Score: ${score}`, 'pass')
	}
}
