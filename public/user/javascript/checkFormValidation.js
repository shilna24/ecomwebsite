var nameError = document.getElementById('AddrName-error');
var nameError2 = document.getElementById('AddrName-error2');
var phoneError = document.getElementById('AddrPhone-error');
var addressError=document.getElementById('AddrAddress-error')
var buildingError = document.getElementById('AddrBuidlingName-error');
var streetError = document.getElementById('AddrStreetName-error');
var cityError = document.getElementById('AddrCity-error');
var districtError = document.getElementById('AddrDistrict-error');
var stateError = document.getElementById('AddrState-error');
var pinError = document.getElementById('AddrPincode-error');
var submitError = document.getElementById('submit-error');

function validateName() {
    var name = document.getElementById('firstName').value;

    if (name.length == 0) {
        nameError.innerHTML = '**firstName is required';
        return false
    }
   
    if ((name.length <= 2) || (name.length > 25)) {
        nameError.innerHTML = '**firstName length must be between 3 and 25';
        return false
    }
    nameError.innerHTML = '<i class="fa fa-check-circle" aria-hidden="true" style="color:green;"></i>';
    return true
}

function validateName2() {
    var name2 = document.getElementById('lastName').value;

    if (name2.length == 0) {
        nameError2.innerHTML = '**lastName is required';
        return false
    }
   
    if ((name2.length < 2) || (name2.length > 25)) {
        nameError2.innerHTML = '**lastName length is short';
        return false
    }
    nameError2.innerHTML = '<i class="fa fa-check-circle" aria-hidden="true" style="color:green;"></i>';
    return true
}

function validatePhone() {
    var phone = document.getElementById('mobileNumber').value;

    if (phone.length == 0) {
        phoneError.innerHTML = '**mobile number is required';
        return false
    }
    if (phone.length != 10) {
        phoneError.innerHTML = '**mobile number should be 10 digits';
        return false
    }
    if (!phone.match(/^[0-9]{10}$/)) {
        phoneError.innerHTML = '**Only digits please';
        return false
    }
    phoneError.innerHTML = '<i class="fa fa-check-circle" aria-hidden="true" style="color:green;"></i>';
    return true
}

function validateAddress() {
    var address = document.getElementById('address').value;

    if (address.length == 0) {
        addressError.innerHTML = '**address is required';
        return false
    }
   
    if ((address.length <= 10) ) {
        addressError.innerHTML = '**address length is short';
        return false
    }
    addressError.innerHTML = '<i class="fa fa-check-circle" aria-hidden="true" style="color:green;"></i>';
    return true
}



function validateDistrict() {
    var district = document.getElementById('district').value;

    if (district.length == 0) {
        districtError.innerHTML = '**district name is required';
        return false
    }
    if (!district.match(/^[A-Za-z]*$/)) {
        districtError.innerHTML = '**Only alphabets';
        return false;
    }
    if ((district.length <= 2) || (district.length > 25)) {
        districtError.innerHTML = '**district name short ';
        return false
    }
    districtError.innerHTML = '<i class="fa fa-check-circle" aria-hidden="true" style="color:green;"></i>';
    return true
}



function validatePincode() {
    var pincode = document.getElementById('pin').value;

    if (pincode.length == 0) {
        pinError.innerHTML = '**pincode is required';
        return false
    }
    if (pincode.length != 6) {
        pinError.innerHTML = '**should be 6 digits';
        return false
    }
    if (!pincode.match(/^[0-9]{6}$/)) {
        pinError.innerHTML = '**Only digits please';
        return false
    }
    pinError.innerHTML = '<i class="fa fa-check-circle" aria-hidden="true" style="color:green;"></i>';
    return true
}

function validateForm() {
    if (!validateName() || !validateName2() || !validateAddress() || !validatePhone() || !validateDistrict() || !validatePincode()) {
        submitError.style.display = 'block'
        submitError.innerHTML = 'Please fill the form';
        setTimeout(function () { submitError.style.display = 'none' }, 3000)
        return false;
    }
}