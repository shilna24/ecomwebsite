function cancelOrder(orderId) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#013542',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, ok it!'
    }).then((result) => {
      if (result.isConfirmed) {
        $.ajax({
          url: '/cancel-order/' + orderId,
          method: 'post',
          success: (response) => {
            Swal.fire({
              icon: 'success',
              title: 'Your order cancelled',
              showConfirmButton: false,
              timer: 1500
            })
            // location.reload()
  
            $('#cartfill').load(location.href + " #cartfill")
          }
        })
      }
    })
  }
  