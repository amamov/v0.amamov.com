const searchBt = document.getElementById('search_bt')
const searchInput = document.getElementById('search_input')

const handleSearchBtClick = () => {
  if (!searchInput.style.display) {
    searchInput.style.display = 'flex'
    searchBt.setAttribute('type', 'button')
  } else {
    searchInput.style.display = ''
    searchBt.setAttribute('type', 'submit')
  }
}

function init() {
  searchBt.addEventListener('click', handleSearchBtClick)
}

init()
