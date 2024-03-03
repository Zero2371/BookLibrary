
class Book {
    constructor(
      title = 'Unknown',
      author = 'Unknown',
      pages = '0',
      isRead = false
    ) {
      this.title = title
      this.author = author
      this.pages = pages
      this.isRead = isRead
    }
  }


class Library{
  constructor() {
    this.books = [];
  }


addBook(newBook){
  if (!this.isInLibrary(newBook)){
    this.books.push(newBook);
  }
}

removeBook(title){
  this.books = this.books.filter((book) => book.title !== title)
}

getBook(title){
  return this.books.find((book) => book.title === title)
}

isInLibrary(newBook){
  return this.books.some((book) => book.title === newBook.title)
}
}


//USER INTERFACE

const accountBtn = document.getElementById("accountBtn");
const accountModal = document.getElementById("accountModal");
const addBookBtn = document.getElementById("addBookBtn");
const addBookModal = document.getElementById("addBookModal");
const errorMsg = document.getElementById("errorMsg");
const overlay = document.getElementById("overlay");
const addBookForm = document.getElementById("addBookForm");
const booksGrid = document.getElementById("booksGrid");
const loggedIn = document.getElementById("loggedIn");
const loggedOut = document.getElementById("loggedOut");
const loadingRing = document.getElementById("loadingRing");

//Dont Need
// const setUpNavbar = (user) => {
//   if (user){
//     loggedIn.classList.add('active')
//     loggedOut.classList.add('active')
//   } else {
//     loggedIn.classList.remove('active')
//     loggedOut.classList.add('active')
//   }
//   loadingRing.classList.remove('active');
// }

const setupAccountModal = (user) => {
  if (user) {
    accountModal.innerHTML = `
      <p>Logged in as</p>
      <p><strong>${user.email.split('@')[0]}</strong></p>`
  } else {
    accountModal.innerHTML = '';
  }
}

const openAddBookModal = () => {
  addBookForm.reset();
  addBookModal.classList.add('active');
  overlay.classList.add('active');
}

const closeAddBookModal = () => {
  addBookModal.classList.remove('active');
  overlay.classList.remove('active');
  errorMsg.classList.remove('active');
  errorMsg.textContent = ''
}

const closeAllModals = () => {
  closeAddBookModal()
  closeAccountModal()
}

const handKeyboardInput = (e) => {
  if (e.key === 'Escape') closeAllModals()
}

const updateBooksGrid = () => {
  resetBooksGrid()
  for (let book of Library.books) {
    createBookCard(book);
  }
}

const resetBooksGrid = () => {
  booksGrid.innerHTML = '';
}

const createBookCard = (book) => {
  const bookCard = document.createElement('div')
  const title = document.createElement('p')
  const author = document.createElement('p')
  const pages = document.createElement('p')
  const buttonGroup = document.createElement('div')
  const readBtn = document.createElement('button')
  const removeBtn = document.createElement('button')

  bookCard.classList.add('book-card');
  buttonGroup.classList.add('button-group');
  readBtn.classList.add('btn');
  removeBtn.classList.add('btn');
  readBtn.onclick = toggelRead
  removeBtn.onclick = removeBook

  title.textContent = `"${book.title}"`
  author.textContent = book.author
  pages.textContent = `${book.pages} pages`
  removeBtn.textContent = 'Remove'

  if(book.isRead) {
    readBtn.textContent = 'Read'
    readBtn.classList.add('btn-green')
  } else {
    readBtn.textContent = 'Not Read'
    readBtn.classList.add('btn-Red')
  }

  bookCard.appendChild(title)
  bookCard.appendChild(author)
  bookCard.appendChild(pages)
  buttonGroup.appendChild(readBtn)
  buttonGroup.appendChild(removeBtn)
  bookCard.appendChild(buttonGroup)
  booksGrid.appendChild(bookCard)
}

const getBookFromInput = () => {

const title = document.getElementById('bookTitle').value
const author = document.getElementById('bookAuthor').value
const pages = document.getElementById('bookPages').value
const isRead = document.getElementById('bookIsRead').value
return new Book(title, author, pages, isRead)
}

const addBook = (e) => {
  e.preventDeafult()
  const newBook = getBookFromInput()

  if (library.isInLibrary(newBook)) {
    errorMsg.textContent = 'This book already exists in your library'
    errorMsg.classList.add('active');
    return
  }
  
  if( auth.currentUser) {
    addBookDB(newBook)
  } else {
    library.addBook(newBook)
    saveLocal()
    updateBooksGrid()
  }

  closeAddBookModal()
}

const removeBook = (e) => {
  const title = e.target.parentNode.praentNode.firstChild.innerHtml.replaceAll(
    "",''
  )

  if (auth.currentUser){
    removeBookDB(title)
  } else {
    library.removeBook(title)
    saveLocal()
    updateBooksGrid()
  }
}

const toggelRead = (e) => {
  const title = e.target.parentNode.parentNode.firstChild.innerHTML.replaceAll(
    '"',
    ''
  )
  const book = library.getBook(title)

  if(auth.currentUser) {
    toggleBookIsReadDB(book)
  } else{
    book.isRead = !book.isRead
    saveLocal()
    updateBooksGrid()
  }
}

  accountBtn.onclick = openAccountModal
  accountBtn.onclick = openAddBookModal
  overlay.onclick = closeAllModals
  addBookForm.onsubmit = addBook
  window.onkeydown = handleKeyboardInput

  //LOCAL STORAGE

  const saveLocal = () => {
    localStorage.setItem('library', JSON.stringify(library.books))
  }

  const restoreLocal = () => {
    const books = JSON.parse(localStorage.getItem('library'))
    if (books){
      library.books = books.map((book) => JSONToBook(book))
    } else {
      ibrary.books = []
    }
  }

  //AUTHENTICATION

  const auth = firebase.auth()
  const logInBtn = document.getElementById('logInBtn')
  const logOutBtn = document.getElementById('logOutBtn')

  auth.onauthStateChanged(async (user) => {
    if (user) {
      setupRealTimeListener()
    } else {
      if (unsubscribe) unsubscribed()
      restoreLocal()
    updateBooksGrid()
    }
    setupAccountModal(user)
    setUpNavbar(user)
  })

  const signIn = () => {
    const provider = new firebase.auth.GoogleAuthProvider()
    auth.signInWithPopup(provider)
  }

  const signOut = () => {
    auth.signOut()
  }

  logInBtn.onclick = signIn
  logOutBtn.onclick = signOut

  // FIRESTONE

  const dB = firebase.firestore()
  let unsubscribe

  const setupRealTimeListener = () => {
    unsubscribe = dB
    .collection('books')
    .where('ownerId', '==', auth.currentUser.uid)
    .orderBy('createdAt')
    .ohSnapshot((snapshot) => {
      library.books = docsToBooks(snapshot.docs)
      updateBooksGrid()
    })
  }

  const addBookDB = (newBook) =>{
    dB.collection('books').add(bookToDoc(newBook))
  }

  const removeBookDB = async (title) => {
    dB.collection('books')
    .doc(await getBookIdDB(book.title))
    .delete()
  }

  const toggleBookIsReadDB = async (book) => {
    dB.collection('books')
    .doc(await getBookIdDB(book.title))
    .update({isRead:  !book.isRead})
  }

  const getBookIdDB = async(title) => {
    const snapshot = await db
    .collection('books')
    .where('ownerId', '==', auth.currentUser.uid)
    .where('title', '==', title)
    .get()
    const bookId = snapshot.docs.map((doc) => doc.id).join('')
    return bookId
  }

  //UTILITIES

  const docsToBooks = (docs) => {
    return docs.map((doc) => {
      return new Book(
        doc.data().title,
        doc.data().author,
        doc.data().pages,
        doc.data().isRead
      )
    })
  } 

  const JSONToBook = (book) => {
    return new Book(book.title, book.author, book.pages, book.isRead)
  }

  const bookToDoc = (book) => {
    return {
      ownerId: auth.currentUser.uid,
      title: book.title,
      author: book.author,
      pages: book.pages,
      isRead: book.isRead,
      createdAt: firebase.firestone.FieldValue.serverTimestamp(),
    }
  } 