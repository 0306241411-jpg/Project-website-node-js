const deleteButtons = document.querySelectorAll(".btn-delete");
const editButtons = document.querySelectorAll(".btn-edit");
const resetPasswordButtons = document.querySelectorAll(".btn-reset-password");

// Xử lý nút xóa
deleteButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const userId = button.dataset.id;
    const userName = button.dataset.username;
    if (confirm(`Bạn có thật sự muốn xóa người dùng ${userName}`)) {
      fetch(`/admin/users_management/${userId}`, { method: "DELETE" })
        .then((respone) => respone.json())
        .then((data) => {
          if (data.success) {
            alert("Đã xóa thành công");
            window.location.reload();
          } else alert("Lỗi :" + data.message);
        });
    }
  });
});

// Xử lý nút sửa
editButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const userId = button.dataset.id;
    if (userId) window.location.href = `/admin/edit_users/${userId}`;
    else alert("Lỗi");
  });
});

// Xử lý nút reset
resetPasswordButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const userId = button.dataset.id;
    const userName = button.dataset.username;
    if (confirm(`Bạn có thật sự muốn reset mật khẩu của ${userName} `)) {
      fetch(`/admin/users_management/${userId}`, { method: "PUT" })
        .then((respone) => respone.json())
        .then((data) => {
          if (data.success) {
            alert(
              "Đã reset thành công! Mật khẩu mới của tài khoản này là: 1234)",
            );
            window.location.reload();
          } else alert("Lỗi :" + data.message);
        });
    }
  });
});

// Xử lý nút thêm người dùng
function openAddModal() {
  // Chuyển hướng sang trang thêm người dùng
  window.location.href = "/admin/users_management/add";
}
