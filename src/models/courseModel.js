var Course = (function (){
    function Course(title, lector, mainCharacters, major, year){
        this.title = title;
        this.lector = lector;
        this.mainCharacters = mainCharacters.split(',').map(function (elem) {
            return elem.trim();
        });
        this.major = major;
        this.year = year;
        this.rate = 0;
        this.rateCount = 0;
    }

    /*
    Course.prototype.method = function method(){

    }
    */

    return Course;
})();

module.exports = Course;