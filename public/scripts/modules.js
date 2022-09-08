import { set as $ } from "../../node_modules/set/src/index.js";

// notification
export function innerNotify(msg, type) {
	const formBody = $("[data-form-body]");
	(formBody.find("[data-notification]")[0]?.at(0) || null)?.remove();
	if (!msg) {
		return;
	}
	const temp = `
    <div class="inner-notification m-b-10" data-notification>
      <div class="inner-notification__content ${type}">
          <p>${msg}</p>
      </div>
    </div>
  `;
	formBody.prepend(temp);
	$("[data-notification]")[0].scrollIntoView({
		// behavior: "smooth",
		block: "center"
	});
}

// toggle modal
let activeModal = null;
export function toggleModal(
	modalOrSelector,
	typeOfStyle = "display",
	valueOfStyle = "block",
	e
) {
	if (!e) {
		e = event;
	}
	e.stopPropagation();
	// get element & update activeModal on global scope
	if ("string" === typeof modalOrSelector) {
		activeModal = document.querySelector(modalOrSelector);
	} else if (modalOrSelector instanceof Node) {
		activeModal = modalOrSelector;
	} else if (modalOrSelector instanceof NodeList) {
		activeModal = modalOrSelector[0];
	}
	if (!activeModal) {
		return;
	}
	// get current style property
	let currentDisplay =
		activeModal.style[typeOfStyle] ||
		getComputedStyle(activeModal)[typeOfStyle] ||
		null;
	if (!currentDisplay) {
		return;
	}
	// check if modal is not displayed and display
	if (currentDisplay !== valueOfStyle) {
		activeModal.style[typeOfStyle] = valueOfStyle;
		document.body.classList.toggle("no-overflow");
	} else {
		activeModal.style[typeOfStyle] = "";
		document.body.classList.toggle("no-overflow");
	}
}