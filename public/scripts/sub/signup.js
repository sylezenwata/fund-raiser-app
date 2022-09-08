import { set as $ } from "../../../node_modules/set/src/index.js";
import { innerNotify } from "../modules.js";

// login form
$("form").on("submit", function (e) {
	e.preventDefault();
	const $this = $(this);
	innerNotify();
	let inputs = $("#signUpForm [name]");
	inputs = inputs.reduce((obj, input) => {
		obj[input.name] = input.value.trim() === "" ? null : input.value.trim();
		return obj;
	}, {});
	$this.disableForm();
	$.ajax({
		url: $this.attr("action")[0],
		method: $this.attr("method")[0],
		body: inputs,
		headers: {
			"Content-Type": "application/json; charset=utf-8",
		},
	})
		.then((res) => {
			const { message, returnUrl } = JSON.parse(res);
			innerNotify(message, "success");
			window.location.href = returnUrl || "/";
		})
		.catch((err) => {
			const response = err.response ? JSON.parse(err.response) : null;
			const msg = response?.message || err.message || "Network error";
			innerNotify(msg, "error");
			$this.disableForm(true);
		});
});
