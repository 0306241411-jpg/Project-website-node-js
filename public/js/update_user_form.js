const form = document.querySelector("#updateUserForm");
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userId = e.target.dataset.id;
  const data = Object.fromEntries(new FormData(e.target));
  try {
    const respone = await fetch(`/admin/edit_user/${userId}`, {
      method: "PUT",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const result = await respone.json();
    if (result.success) {
      alert("Cập nhật thành công");
      window.location.href = "/admin/users_management";
    }
  } catch (err) {
    console.error("Lỗi: ", err);
    alert("Lỗi");
  }
});
