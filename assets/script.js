const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        
        e.preventDefault();

        
        const usernameInput = document.getElementById('username').value;
        const passwordInput = document.getElementById('password').value;
        const correctUsername = "admin";
        const correctPassword = "admin123";

        if (usernameInput === correctUsername && passwordInput === correctPassword) {
            
            localStorage.setItem('isLoggedIn', 'true');
            
            window.location.href = 'main.html'; 
        } else {
            alert('Invalid credentials! Please use the demo login provided.');
        }
    });
}