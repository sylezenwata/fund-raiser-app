import { set as $ } from "../../node_modules/set/src/index.js";
import { toggleModal } from "./modules.js";

// modal
$("[data-toggle-modal]").on("click", function () {
	const $this = $(this);
	const modalSelector = `[data-modal="${$this.data("data-toggle-modal")[0]}"]`;
	toggleModal(modalSelector);
});
