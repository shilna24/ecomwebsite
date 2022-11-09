function fillForm(oneAddress, index) {
    let address = JSON.parse(oneAddress)
    document.getElementById('firstName').value = address.firstName
    document.getElementById('lastName').value = address.lastName
    document.getElementById('mobileNumber').value = address.phone
    document.getElementById('address').value = address.address
    document.getElementById('state').value = address.state
    document.getElementById('district').value = address.district
    document.getElementById('pin').value = address.pincode
    document.getElementById('index').value = index


}

function redeem(total) {
    let coupCode = document.getElementById('ccod')?.value
    console.log(coupCode);
    $.ajax({
        url: '/redeem/' + coupCode + '/' + total,
        method: 'post',
        success: (response) => {
            if (response.invalidCoupon) {
                Swal.fire({
                icon: 'warning',
                text: 'coupen invalid',
                showConfirmButton: true,
            })
            } else if (response.expired) {
                Swal.fire({
                icon: 'warning',
                text: 'coupen expired',
                showConfirmButton: true,
            })
            } else if (response.minimunPurchase) {
                Swal.fire({
                icon: 'warning',
                text: 'lessthan minimum purchase',
                showConfirmButton: true,
            })
            } else if (response.alreadyApplied) {
                Swal.fire({
                icon: 'warning',
                text: 'already applied',
                showConfirmButton: true,
            })
            } else {
                // console.log('lllll');
                let finalAmount
                let couponDscnPerc = response.discount
                let couponDiscountAmount = (total * couponDscnPerc) / 100
                let x = Math.floor(couponDiscountAmount)
                if (x > response.maxLimit) {
                    // x = response.maxLimit
                    finalAmount = total - x
                }
                finalAmount = total - x
                console.log(finalAmount);
                document.getElementById('lsttotal').innerHTML = finalAmount
                document.getElementById('passlsttotal').value = finalAmount
                document.getElementById('discnt').innerHTML = x

                console.log(x);
            }


        }
    })
}

document.forms["checkoutForm"].addEventListener("submit", async (event) => {
    event.preventDefault();
    const paymentType = $('input[name=paymentType]:checked', '#checkoutForm').val()
    var data = $("form").serialize();
    console.log(paymentType, 'jjjj');
    console.log(data);

    if (paymentType == "cod") {
        checkout(data)

    } else {
        const amount = document.getElementById("passlsttotal").value
        console.log(amount)
        try {
            const settings = await axios({
                "url": "/payment/orderId",
                "method": "post",
                "data": {
                    "amount": amount
                }
            });
            orderId = settings.data.orderId;
            console.log(orderId)
            await razorpay(orderId, amount, data)

            console.log("2222222222");
        } catch (err) {
            console.error(err)
        }
        // razorpay(orderId, amount)
    }
});

function checkout(data) {
    $.ajax({
        url: '/placeOrder',
        method: 'post',
        data: data,
        success: (response) => {
            console.log(response, 'lllll');
            Swal.fire({
                icon: 'success',
                title: 'okeyyy!..',
                text: 'Successfully Order Placed',
                showConfirmButton: false,
            })
            setTimeout(() => {
                // location.reload()
                window.location = "/order-success"
            }, 1000)
        }
    })
}

function razorpay(orderId, amount, data) {
    let options = {
        "key": "rzp_test_tp9aniMXncCN6a", // - Enter the Key ID generated from the Dashboard
        "name": "HerStyle",
        "amount": amount,
        "order_id": orderId, // For one time payment
        "retry": false,
        "theme": {
            "color": "#273952"
        },
        // This handler function will handle the success payment
        "handler": async function (response) {
            // alert(response.razorpay_payment_id);
            try {
                const verification = await axios({
                    method: "post",
                    url: `/payment/verify/${orderId}`,
                    data: {
                        response: response,
                    }
                })
                if (verification.data.signatureIsValid) {
                    const paymentId = response.razorpay_payment_id

                    //appending order Id and payment id to data to update on database

                    // data.append("orderId", orderId)
                    // data.append("paymentId", paymentId)

                    //calling checkout after payment verification
                    checkout(data)

                } else {
                    await Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'Payment Failed!',
                        confirmButtonColor: '#013542',
                        width: "25em",
                        timer: 2000,
                    })
                    window.location = "/checkout"
                }
            } catch (err) {
                console.log(err)
                window.location = "/"
            }

        },
    };
    const rzp1 = new Razorpay(options);
    rzp1.open();
    rzp1.on('payment.failed', async function (response) {
        await Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Payment Failed!',
            confirmButtonColor: '#273952',
            width: "25em",
            timer: 2000,
        })
        console.log("im going to checkout")
        window.location = "/checkout"
    });

}

function deleteAdddress(addressIndex) {
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#013542',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: '/delete-address/' + addressIndex,
                method: 'delete',
                success: (response) => {

                    $('#add-ress-reload').load(location.href + " #add-ress-reload")
                }
            })
        }
    })
}