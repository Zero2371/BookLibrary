
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




document.addEventListener("DOMContentLoaded", function() {
    const addBookButton = document.getElementById("addBook");
    const bookForm = document.getElementById("bookForm");

    addBookButton.addEventListener("click", function() {
        if (bookForm.style.display === "none" || bookForm.style.display === "") {
            bookForm.style.display = "block";
        } else {
            bookForm.style.display = "none";
        }
    });
});