function myFunction() {
    var x = document.getElementById("myDIV");
    console.log("display will he hidden or shown");
    if (x.style.display === "none") {
      x.style.display = "block";
    } else {
      x.style.display = "none";
    }
  }