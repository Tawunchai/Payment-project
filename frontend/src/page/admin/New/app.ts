const inputs = document.querySelectorAll<HTMLInputElement>(".contact-input");
const toggleBtn = document.querySelector<HTMLButtonElement>(".theme-toggle");
const allElements = document.querySelectorAll<HTMLElement>("*");

if (toggleBtn) {
  toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    allElements.forEach((el) => {
      el.classList.add("transition");
      setTimeout(() => {
        el.classList.remove("transition");
      }, 1000);
    });
  });
}

inputs.forEach((ipt) => {
  ipt.addEventListener("focus", () => {
    ipt.parentElement?.classList.add("focus", "not-empty");
  });

  ipt.addEventListener("blur", () => {
    if (ipt.value === "") {
      ipt.parentElement?.classList.remove("not-empty");
    }
    ipt.parentElement?.classList.remove("focus");
  });
});
