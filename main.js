const board = document.querySelector("#board");
const mineCounter = document.querySelector("#mine-counter")
const highScore = document.querySelector("#high-score")
const form = document.querySelector('#controls')
const rowSelector = document.querySelector("#rowSelector")
const columnSelector = document.querySelector("#columnSelector")
const mineSelector = document.querySelector("#mineSelector")


const safeCells = []
// 1 = 1x1, 2 = 2x2, 3 = 3x3...
let firstClick = true;
let lost = false;
let minesFlagged = 0;
let startTime
let won = true;
let elasped = 0;
let mouseDown = -1
let settings = {
    rows : 9,
    columns : 9,
    mines : 10,
    level : 0
}

const customRadio = document.getElementById('custom');
const customInputs = [rowSelector, columnSelector, mineSelector];

customRadio.addEventListener('change', () => {
  if (customRadio.checked) {
    customInputs.forEach(input => input.required = true);
  }
});

document.querySelectorAll('input[name="levels"]').forEach(radio => {
  if (radio !== customRadio) {
    radio.addEventListener('change', () => {
      customInputs.forEach(input => input.required = false);
    });
  }
});

const winHelper = () => {
    console.log("you win")
    won = true
    mineCounter.textContent = "YOU WIN"
    elasped = Math.round(elasped * 10) / 10000
    console.log(settings.level)
    if(settings.level == 0){
        const beginnerHighScore = parseFloat(getCookie("beginner"));
        if(!beginnerHighScore || elasped < beginnerHighScore){
    
        document.cookie = `beginner=${elasped};expires=Thu, 18 Dec 2033 12:00:00 UTC `
        highScore.textContent = `Beginner: ${getCookie("beginner")} Seconds`
        }
    } else if(settings.level == 1){
        const intermediateHighScore = parseFloat(getCookie("intermediate"));
        if(!intermediateHighScore || elasped < intermediateHighScore){
        document.cookie = `intermediate=${elasped};expires=Thu, 18 Dec 2033 12:00:00 UTC `
        highScore.textContent = `Intermediate: ${getCookie("intermediate")} Seconds`
        }
    } else if(settings.level == 2){
        const expertHighScore = parseFloat(getCookie("expert"));
        if(!expertHighScore || elasped < expertHighScore){
        document.cookie = `expert=${elasped};expires=Thu, 18 Dec 2033 12:00:00 UTC `
        highScore.textContent = `Expert: ${getCookie("expert")} Seconds`
        }
    }
}

const loseHelper = cell => {
    //TK make it so it reveals mines
    cell.style.backgroundImage = `url("Images/redMine.jpg")`
    console.log("you lose")
    lost = true;
    mineCounter.textContent = "YOU LOST"
    document.querySelectorAll(".mine").forEach(mine => {
        mine.classList.remove("covered")
    })
}

const recursiveHelper = cell => {
    if(cell.dataset.mines == 0){
        
        for(let i = -1; i < 2; i++){
            for(let j = -1; j < 2; j++){
        let reveal = document.querySelector(`[data-row="${parseInt(cell.dataset.row) + j}"][data-column="${parseInt(cell.dataset.column) + i}"]`)
            if(!reveal?.classList.contains("covered") != undefined && reveal?.classList.contains("covered") == true && !reveal?.classList.contains("flagged")){   
                reveal.classList.add(`mine${reveal.dataset.mines}`) 
                                
                reveal.classList.remove("covered")
                if(reveal.dataset.mines == 0){
                    revealCellsHelper(reveal)
                }
            }
            }
        }
    }
}

const middleClickHelper = cell => {
    if(cell?.classList.contains("cell")){
        if(!cell.classList.contains("flagged")){
            cell?.classList.remove("covered")
            cell.classList.add(`mine${cell.dataset.mines}`)
            recursiveHelper(cell)

            if(cell.classList.contains("mine")){
                loseHelper(cell)
            }
        }
        
    }
}

const revealCellsHelper = cell => {
    revealCellHelper(cell)
    recursiveHelper(cell)
}

const revealCellHelper = cell => {
    if(cell?.classList.contains("cell")){
    cell?.classList.remove("covered")
    if(!cell.classList.contains("mine") && !cell.classList.contains("flagged")){
        
        cell.classList.add(`mine${cell.dataset.mines}`)
    } 
    }
}



const createBoard = (ROWS, COLUMNS) => {
  board.innerHTML = "";
  board.addEventListener('mousedown', (event) => {
    if (event.button === 1) {
      event.preventDefault();
    }
  });

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLUMNS; col++) {
      board.insertAdjacentHTML("beforeend", `<span class="cell covered" data-row="${row}" data-column="${col}" data-mines="0" data-flags="0"></span>`);
    }
  }
  board.style.gridTemplateColumns = `repeat(${COLUMNS}, var(--cell-size))`;
}
const  updateCellSize = (columns) => {
  const screenWidth = window.innerWidth;
  const padding = 20;
  const maxCellSize = 25;
  let cellSize = Math.floor((screenWidth - padding) / columns);
  if (cellSize > maxCellSize) cellSize = maxCellSize;
  document.documentElement.style.setProperty('--cell-size', `${cellSize}px`);
  board.style.gridTemplateColumns = `repeat(${columns}, var(--cell-size))`;
}

const updateMines = nearby => {
    if(nearby?.classList.contains("cell")){
        nearby.dataset.mines++
    }
}

const updateFlags = (nearby, increment) => {
    if(nearby?.classList.contains("cell")){
        nearby.dataset.flags = parseInt(nearby.dataset.flags) + increment
    }
}

const surroundingCells = (element, callback, increment) => {
    for(let i = -1; i < 2; i++){
        for(let j = -1; j < 2; j++){
            let nearby = document.querySelector(`[data-row="${parseInt(element.dataset.row) + j}"][data-column="${parseInt(element.dataset.column) + i}"]`)
            callback(nearby, increment)
        }
    }
}

const addMine = event => {
    for(let i = -1; i < 2; i++){
        for(let j = -1; j < 2; j++){
            let safe = document.querySelector(`[data-row="${parseInt(event.currentTarget.dataset.row) + j}"][data-column="${parseInt(event.currentTarget.dataset.column) + i}"]`)
                if(safe?.classList.contains("cell")){
                    safeCells.push(safe)
                }
        }
    }
    const row = Math.floor((Math.random() * settings.rows))
        const column = Math.floor((Math.random() * settings.columns))
        const element = document.querySelector(`[data-row="${row}"][data-column="${column}"]`)
        if(!element.classList.contains("mine") && !safeCells.includes(element)){
            element.classList.add("mine")
            surroundingCells(element, updateMines)
            
        } else{
            addMine(event)
        }
}

const firstClickEvent = event => {
    startTime = new Date();
        for(let i = 0; i < settings.mines; i++){
            addMine(event)
        }
        firstClick = false;
    
}

const handleCellClick = () => {
    
    document.addEventListener('mousedown', event => {
        mouseDown = event.button
    })
        document.addEventListener('mouseup', () => {
        mouseDown = -1
    })

    const cells = document.querySelectorAll(".cell")
    cells.forEach(cell => {
        cell.addEventListener("mouseup", event => {
            console.log("bang")
                surroundingCells(cell, (nearby) => {
                    if(nearby && nearby.classList.contains("covered") && !nearby.classList.contains("flagged")) nearby.style.backgroundImage = ''
                } )
            

            console.log(event.button)
            console.log(cell)
         
    //generates the mines after first click, as long as it is a normal click and uncovers something
    if(firstClick && event.button == 0 && !event.currentTarget.classList.contains("flagged")){
        firstClickEvent(event)
    }
    
           if(!cell.classList.contains("flagged")){
            
            
                if(event.button == 0){
                    cell.classList.remove("covered")
                if(cell.classList.contains("mine")){                    
                    loseHelper(cell)
                } else{
                revealCellsHelper(cell)
                cell.classList.remove("covered")   
                }
                }
                                        // make it so the flags around it is equal to the mineN class N 
                if((event.button == 1 || event.button == 0) && event.currentTarget.dataset.flags == event.currentTarget.dataset.mines && !event.currentTarget.classList.contains("covered")){
                    //middle click function
                    surroundingCells(cell, middleClickHelper, 1)
                }
            }

           // check if they won/win
         won = true
         document.querySelectorAll(".covered").forEach(cell => {
            if(!cell.classList.contains("mine")){
                won = false
            }
           })
           
           if(won){
            winHelper()
           }
        })

        cell.addEventListener("mouseenter", () => {
                        if(mouseDown == 1) surroundingCells(cell, (nearby) => { 
                if (nearby && nearby.classList.contains("covered") && !nearby.classList.contains("flagged")) nearby.style.backgroundImage = 'url("Images/Minesweeper_0.svg")'
            })

          if (cell.classList.contains("covered") && !cell.classList.contains("flagged") && mouseDown == 0)cell.style.backgroundImage = 'url("Images/Minesweeper_0.svg")'

        });
// get when mouse down and when up take away style and the surronding
        
        cell.addEventListener("mouseleave", () => {
                surroundingCells(cell, (nearby) => {
                    console.log(nearby)
                    if (nearby && nearby.classList.contains("covered") && !nearby.classList.contains("flagged")) nearby.style.backgroundImage = ''
                    
                } )
            
        });
        
        cell.addEventListener("mousedown", event => {
            if (cell.classList.contains("covered") && !cell.classList.contains("flagged") && event.button == 0) cell.style.backgroundImage = 'url("Images/Minesweeper_0.svg")'
            
            else if(event.button == 1){
                surroundingCells(cell, (nearby) => {
                    if(nearby && nearby.classList.contains("covered") && !nearby.classList.contains("flagged")) nearby.style.backgroundImage = 'url("Images/Minesweeper_0.svg")'
                } )
            }
        


            if(event.ctrlKey || event.button == 2){
                if(cell.classList.contains("covered")) {
                    if(cell.classList.toggle("flagged")){
                        minesFlagged++
                        surroundingCells(cell, updateFlags, 1)
                    } else {
                        minesFlagged--
                        surroundingCells(cell, updateFlags, -1)
                    }
                    mineCounter.innerHTML = `Mines left: ${settings.mines-minesFlagged}`
                    if(minesFlagged > settings.mines){
                        mineCounter.innerHTML = `Mines left: ${settings.mines-minesFlagged}`   
                    }
                }
            }
        })
    })
}

document.querySelectorAll(".ticker").forEach((element, index) => {
    element.addEventListener("focus", () => {
        custom.checked = true;
    })
    element.addEventListener("change", event => {
        mineSelector.setAttribute("max", (rowSelector.value * columnSelector.value) - 9)
        
    })
    element.setAttribute("value", getCookie("custom").split(",")[index])
    if(element.getAttribute("id") == "mineSelector"){
        element.setAttribute("max", getCookie("custom").split(",")[getCookie("custom").split(",").length - 1])
    }
})

form.addEventListener("click", event => {
    let cookie;
    if(event.target.getAttribute("id") == "beginner"){
        if(getCookie("beginner") == ``){
            cookie = 0
        } else {
            cookie = getCookie("beginner")
        }
        highScore.textContent = `Highscore: ${cookie} Seconds`
    } else if(event.target.getAttribute("id") == "intermediate"){
        if(getCookie("intermediate") == ``){
            cookie = 0
        } else {
            cookie = getCookie("intermediate")
        }
        highScore.textContent = `Highscore: ${cookie} Seconds`
    } else if(event.target.getAttribute("id") == "expert"){
        if(getCookie("expert") == ``){
            cookie = 0
        } else {
            cookie = getCookie("expert")
        }
        highScore.textContent = `Highscore: ${cookie} Seconds`
    }
    
})
// hitting generate button
form.addEventListener("submit", event => {
    event.preventDefault()
    won = false
    lost = false
    settings.level = document.querySelector('input[name="levels"]:checked')?.value;
    
    if(settings.level == 0){
        settings.rows = 9
        settings.mines = 10
        settings.columns = 9
    } else if(settings.level == 1){
        settings.rows = 16
        settings.mines = 40
        settings.columns = 16
    } else if (settings.level == 2){
        settings.rows = 16
        settings.mines = 99
        settings.columns = 30
    } else if (settings.level == 3){
        settings.rows = rowSelector.value.trim()
        settings.mines = mineSelector.value.trim()
        settings.columns = columnSelector.value.trim()
        document.cookie = `custom=${[rowSelector.value, columnSelector.value, mineSelector.value, (rowSelector.value * columnSelector.value - 9)]};expires=Thu, 18 Dec 2033 12:00:00 UTC `
        mineSelector.setAttribute("max", (rowSelector.value * columnSelector.value) - 9)
    }

    firstClick = true;
    timer.textContent = 0 + " Seconds";
    minesFlagged = 0;
    mineCounter.innerHTML = `Mines left: ${settings.mines-minesFlagged}` 
    createBoard(settings.rows, settings.columns)
    updateCellSize(settings.columns)
    handleCellClick()  
})
window.addEventListener("resize", () => {
  updateCellSize(settings.columns);
});

//update timer
setInterval(function() {
    if(!won && !lost && !firstClick){
    elasped = new Date() - startTime; 
    console.log(elasped)
    timer.textContent = Math.floor(elasped/1000) + " Seconds"
    }
  }, 1000);

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

mineCounter.innerHTML = `Mines left: ${settings.mines-minesFlagged}`
timer.textContent = 0 + " Seconds";

highScore.textContent = `Highscore: ${getCookie("beginner")} 0 Seconds`
console.log(getCookie("custom").split(",")[getCookie("custom").split(",").length - 1])

createBoard(settings.rows, settings.columns)
handleCellClick()
