//cart Adder
async function cartAdder(prId) {
    console.log(prId)

    //Specific Cookie Extractor code am AMIGOS********
    let cookieHeaderValue = document.cookie;
    let token = null;

    if (cookieHeaderValue) {
        let cookies = cookieHeaderValue.split(";");
        for (let cookie of cookies) {
            let [cookieName, cookieValue] = cookie.trim().split("=");
            if (cookieName === "token") {
                token = cookieValue;
                break;
            }
        }
    }
    //Specific Cookie Extractor code am AMIGOS********

    try {
        const response = await fetch(`/api/cart?prId=${prId}&tk=${token}`);
        if (!response.ok) {
            throw new Error('Request failed with status ' + response.status);
        }
        const responseData = await response.json();

        // Check if the response indicates a redirect is needed
        if (responseData.success) {
            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'The Product Is Added to The Cart',
                showConfirmButton: false,
                timer: 1500
            })
        } else {
            window.location.href = responseData.redirect; // Redirect the browser
        }
    } catch (error) {
        // Handle any errors that occurred during the request
        console.error('Error:', error);
    }
}