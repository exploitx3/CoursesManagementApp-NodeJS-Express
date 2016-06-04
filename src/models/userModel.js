var passwordHashFunc = require('password-hash-and-salt');
var User = (function () {
    function User(username, hashedPassword, isEmployeeString) {
        this.username = username;
        this.password = hashedPassword;
        this.isEmployee = isEmployeeString === "on";
    }

    /*
     User.prototype.method = function method(){

     }
     */

    return User;
})();

module.exports = User;