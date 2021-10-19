const logo = document.getElementById('logo')
const searchBt = document.getElementById('search_bt')
const searchInput = document.getElementById('search_input')

const handleSearchBtClick = () => {
  if (window.innerWidth <= 576) {
    if (!searchInput.style.display) {
      searchInput.style.display = 'flex'
      searchBt.setAttribute('type', 'button')
    } else {
      searchInput.style.display = ''
      searchBt.setAttribute('type', 'submit')
    }
  }
}

const handleLogoClick = () => {
  location.href = '/'
}

function init() {
  logo.addEventListener('click', handleLogoClick)
  searchBt.addEventListener('click', handleSearchBtClick)
}

init()
