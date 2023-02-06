let cards = [];
let gameInProgress = false
let shufflingInProgress = false
let cardsRevealed = false
let score = 0
let roundNumber = 0
let maxRounds = 4
let gameObj = {}

const cardObjectDefinitions = [
  { id: 1, imagePath: '/images/card-KingHearts.png'},
  { id: 2, imagePath: '/images/card-JackClubs.png'},
  { id: 3, imagePath: '/images/card-QueenDiamonds.png'},
  { id: 4, imagePath: '/images/card-AceSpades.png'}
]
const cardBackImgPath = '/images/card-back-blue.png';
const cardContainerElem = document.querySelector('.card-container');
const cardPositions = []
const playGameButtonElem = document.getElementById('playGame');
const collapsedGridAreaTemplate = '"a a" "a a"';
const cardCollectionCellClass = ".card-pos-a"
const numCards = cardObjectDefinitions.length
const aceId = 4
const currentGameStatusElem = document.querySelector('.current-status')
const winColor = 'green'
const loseColor = 'red'
const primaryColor = 'black'
const scoreContainerElem = document.querySelector('.header-score-container')
const scoreElem = document.querySelector('.score')
const roundContainerElem = document.querySelector('.header-round-container')
const roundElem = document.querySelector('.round')
const localStorageGameKey = 'HTA'


/* 
  <div class="card">
  <div class="card-inner">
    <div class="card-front">
      <img src="" alt="" class="card-img">
    </div>
    <div class="card-back">
      <img src="" alt="" class="card-img">
    </div>
  </div>
</div>

*/

function createCards() {
  cardObjectDefinitions.forEach(cardItem => {
    createCard(cardItem);
  })
}


function createCard(cardItem) {
  //cria divs das cartas
  const cardElem = createElement('div');
  const cardInnerElem = createElement('div');
  const cardFrontElem = createElement('div');
  const cardBackElem = createElement('div');

  //cria imagens das cartas, frente e verso
  const cardFrontImg = createElement('img');
  const cardBackImg = createElement('img');

  //adiciona as classes
  addClassToElement(cardElem, 'card');
  addClassToElement(cardElem, 'fly-in');
  addClassToElement(cardInnerElem, 'card-inner');
  addClassToElement(cardFrontElem, 'card-front');
  addClassToElement(cardBackElem, 'card-back');
  addClassToElement(cardFrontImg, 'card-img');
  addClassToElement(cardBackImg, 'card-img')

  //adiciona Ids
  addIdToElement(cardElem, cardItem.id)
  
  //addiciona src as imagens e valores apropriados(verso da carta)
  addSrcToImageElem(cardBackImg, cardBackImgPath);

  //addiciona src as imagens e valores apropriados(frente da carta)
  addSrcToImageElem(cardFrontImg, cardItem.imagePath);

  //adiciona os elementos filhos
  // addChildElement(cardContainerElem, cardElem);
  addChildElement(cardElem, cardInnerElem);
  addChildElement(cardInnerElem, cardFrontElem);
  addChildElement(cardFrontElem, cardFrontImg);
  addChildElement(cardInnerElem, cardBackElem);
  addChildElement(cardBackElem, cardBackImg);

  //addiciona as cartas como um elemento filho para o grid apropriado
  addCardToGridCell(cardElem)

  //inicializa as posições das cartas
  initializeCardPositions(cardElem)

  attachClickEventHandlerToCard(cardElem)
}

function createElement(elemType) {
  return document.createElement(elemType)
}

function addClassToElement(element, className) {
  element.classList.add(className);
}

function addIdToElement(element, id) {
  element.id = id;
}

function addSrcToImageElem(imgElement, src) {
  imgElement.src = src;
}

function addChildElement(parentElem, childElem) {
  parentElem.appendChild(childElem)
}

function addCardToGridCell(card) {
  const cardPositionClassName = mapCardIdToGridCell(card);
  const cardPosElem = document.querySelector(cardPositionClassName);
  addChildElement(cardPosElem, card)
}



function mapCardIdToGridCell(card) {
  if (card.id == 1) return '.card-pos-a'
  else if (card.id == 2) return '.card-pos-b'
  else if (card.id == 3) return '.card-pos-c'
  return '.card-pos-d'
}

// funções orientadas a incializar estados do jogo
function initializeNewGame() {
  score = 0
  roundNumber = 0

  checkForIncompleteGame()

  shufflingInProgress = false

  updateStatusElement(scoreContainerElem, 'flex')
  updateStatusElement(roundContainerElem, 'flex')

  updateStatusElement(scoreElem, 'block', primaryColor, `Placar <span class="badge">${score}</span>`)
  updateStatusElement(roundElem, 'block', primaryColor, `Round <span class="badge">${roundNumber}</span>`)
}

function initializeNewRound() {
  roundNumber++
  playGameButtonElem.disabled = true
  gameInProgress = true
  shufflingInProgress = true
  cardsRevealed = false

  updateStatusElement(currentGameStatusElem, 'block', primaryColor, 'Embaralhando...aguarde')

  updateStatusElement(roundElem, 'block', primaryColor, `Round <span class='badge'>${roundNumber}</span>`)
}

function attachClickEventHandlerToCard(card) {
  card.addEventListener('click', () => chooseCard(card))
}

function initializeCardPositions(card) {
  cardPositions.push(card.id)
}

function checkForIncompleteGame() {
  const serializedGameObj = getLocalstorageItemValue(localStorageGameKey)
  if (serializedGameObj) {
    gameObj = getObjectFromJSON(serializedGameObj)
    if (gameObj.roundNumber >= maxRounds){
      removeLocalStorageItem(localStorageGameKey) 
    } else {
      if(confirm('Gostaria de continuar de onde parou seu último jogo?')) {
        score = gameObj.score
        roundNumber = gameObj.roundNumber
      }
    }
  }
}

function startGame() {
  initializeNewGame()
  startRound()
}

function gameOver() {

  const gameOverMessage = `Não tem xororô, esse jogo...acabou! Placar Final - <span class='badge'>${score}</span>
                          Clique em "Jogar" para jogar novamente`

  updateStatusElement(scoreContainerElem, 'none')
  updateStatusElement(roundContainerElem, 'none')

  updateStatusElement(currentGameStatusElem, 'block', primaryColor, gameOverMessage)

  gameInProgress = false
  playGameButtonElem.disabled = false

  removeLocalStorageItem(localStorageGameKey) 
}

function startRound() {
  initializeNewRound()
  collectCards()
  flipCards(true)
  shuffleCards()
}
 
function endRound () {
  setTimeout(() => {
    if (roundNumber == maxRounds) {
      gameOver()
      return 
    } else {
      startRound()
    }    
  }, 3000) 
}

function loadGame() {
  createCards()

  cardFlyInEffect()

  cards = document.querySelectorAll('.card');

  playGameButtonElem.addEventListener('click', () => startGame());

  updateStatusElement(scoreContainerElem,'none')
  updateStatusElement(roundContainerElem,'none')

}

function calculateScoreToAd(roundNumber) {
  if(roundNumber == 1)  return 100
  else if(roundNumber == 2)  return 50
  else if(roundNumber == 3)  return 25
  else return 10
}

function calculateScore() {
  const scoreToAdd = calculateScoreToAd(roundNumber)
  score = score + scoreToAdd
}

function saveGame() {
  calculateScore()
}

function updateScore() {
  calculateScore()
  updateStatusElement(scoreElem, 'block', primaryColor, `Placar <span class='badge'>${score}</span>`)

}

function updateStatusElement(element, display, color, innerHTML) {
  element.style.display = display

  if(arguments.length > 2) {
    element.style.color = color
    element.innerHTML = innerHTML
  }
}

function canChooseCard() {
  return gameInProgress && !shufflingInProgress && !cardsRevealed
}

function chooseCard(card) {
  if (canChooseCard()) {
    evaluateCardChoice(card)
    saveGameObjToLocalStorage(score, roundNumber)
    console.log(score, roundNumber)
    flipCard(card, false)

    setTimeout(() => {
      flipCards(false)
      updateStatusElement(currentGameStatusElem, 'block', primaryColor, 'Posição das cartas foi revelada')

      endRound()
    }, 3000)

    cardsRevealed = true
  } else {

  }
}

function outputChoiceFeedBack(hit) {
  if (hit) {
    updateStatusElement(currentGameStatusElem, 'block', winColor, 'Hit!! - Boa! Você Consegiu! :)')
  } else {
    updateStatusElement(currentGameStatusElem, 'block', loseColor, 'Não foi dessa vez... :(')
  }
}

function evaluateCardChoice(card) {
  if (card.id == aceId) {
    updateScore()
    outputChoiceFeedBack(true)
  } else {
    outputChoiceFeedBack(false)
  }
}

function transformGridArea(areas) {
  cardContainerElem.style.gridTemplateAreas = areas
}

function addCardsToGridAreaCell(cellPositionClassName) {
  const cellPositionElem = document.querySelector(cellPositionClassName);

  cards.forEach((card, index) => {
    addChildElement(cellPositionElem, card)
  })
}

function flipCard(card, flipToBack){
  const innerCardElem = card.firstChild
  if (flipToBack && !innerCardElem.classList.contains('flip-it')) {
    innerCardElem.classList.add('flip-it')
  } else if (innerCardElem.classList.contains('flip-it')) {
    innerCardElem.classList.remove('flip-it')
  }
}

function flipCards(flipToBack){
  cards.forEach((card, index) => {
    setTimeout(() => {
      flipCard(card, flipToBack)
    }, index * 100)
  })
}

function cardFlyInEffect() {
  const id = setInterval(flyIn, 5)
  let cardCount = 0;
  let count = 0;

  function flyIn() {
    count++
    if(cardCount == numCards) {
      playGameButtonElem.style.display = 'inline-block'
      clearInterval(id)
    }
    if ([1, 250, 500, 750].includes(count)) {
      cardCount++
      let card = document.getElementById(cardCount)
      card.classList.remove('fly-in')
    } 
  }
}

function randomizeCardPositions() {
  const rnd = Math.floor(Math.random() * numCards) + 1
  const rnd2 = Math.floor(Math.random() * numCards) + 1

  const temp = cardPositions[rnd - 1]

  cardPositions[rnd - 1] = cardPositions[rnd2 - 1]
  cardPositions[rnd2 - 1] = temp

}

function removeShuffleClasses() {
  cards.forEach((card) => {
    card.classList.remove('shuffle-left')
    card.classList.remove('shuffle-right')
  })
}

function animateShuffle(shuffleCount) {
  const randomNumber1 = Math.floor(Math.random() * numCards) + 1
  const randomNumber2 = Math.floor(Math.random() * numCards) + 1

  let card1 = document.getElementById(randomNumber1)
  let card2 = document.getElementById(randomNumber2)

  if (shuffleCount % 4 == 0) {
    card1.classList.toggle('shuffle-left')
    card1.style.zIndex = 100
  }

  if (shuffleCount % 10 == 0) {
    card2.classList.toggle('shuffle-right')
    card2.style.zIndex = 200
  }
}

function shuffleCards() {
  const id = setInterval(shuffle, 12)
  let shuffleCount = 0

  function shuffle() {

    randomizeCardPositions()
    animateShuffle(shuffleCount)
    if (shuffleCount == 500) {
      clearInterval(id)
      shufflingInProgress = false
      removeShuffleClasses()
      dealCards()
      updateStatusElement(currentGameStatusElem, 'block', primaryColor, 'Clique na carta que você acha que está o às de espadas! Será que você sabe qual é?')
    } else {
      shuffleCount++;
    }
  }
}

function returnGridAreasMappedToCardPos() {
  let firstPart = '';
  let secondPart = '';
  let areas = '';

  cards.forEach((card, index) => {
    if (cardPositions[index] == 1) {
      areas = areas + "a "
    } 
    else if (cardPositions[index] == 2) {
      areas = areas + "b "
    }
    else if (cardPositions[index] == 3) {
      areas = areas + "c "
    }
    else if (cardPositions[index] == 4) {
      areas = areas + "d "
    }

    if (index == 1) {
      firstPart = areas.substring(0, areas.length - 1)
      areas = '';
    }
    else if (index == 3) {
      secondPart = areas.substring(0, areas.length - 1)
    }    
  })
  return `"${firstPart}" "${secondPart}"`
}

function dealCards() {
  addCardsToAppropriateCell()
  const areasTemplate = returnGridAreasMappedToCardPos()
  transformGridArea(areasTemplate)
}

function addCardsToAppropriateCell() {
  cards.forEach((card) => {
    addCardToGridCell(card)
  })
}


function collectCards() {
  transformGridArea(collapsedGridAreaTemplate)
  addCardsToGridAreaCell(cardCollectionCellClass)
}


//local storage functions
function getSerializedObjectAsJSON(obj) {
  return JSON.stringify(obj)
}

function getObjectFromJSON(json) {
  return JSON.parse(json)
}

function updateLocalStorageItem(key, value) {
  localStorage.setItem(key, value)
}

function removeLocalStorageItem(key) {
  localStorage.removeItem(key)
}

function getLocalstorageItemValue(key) {
  return localStorage.getItem(key)
}

function updateGameObject(score, round) {
  gameObj.score = score;
  gameObj.roundNumber = round
}

function saveGameObjToLocalStorage(score, round) {
  updateGameObject(score, round)
  console.log(gameObj)
  updateLocalStorageItem(localStorageGameKey, getSerializedObjectAsJSON(gameObj))
}

loadGame()