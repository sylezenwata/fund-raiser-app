import { set as $ } from "../../../node_modules/set/src/index.js";
import { innerNotify } from "../modules.js";

// login form
$("form").on("submit", function (e) {
	e.preventDefault();
	const $this = $(this);
	innerNotify();
	let inputs = $("#donationForm [name]");
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
			innerNotify(res, "success");
			setTimeout(() => window.location.reload(), 3 * 1000);
		})
		.catch((err) => {
			const response = err.response ? JSON.parse(err.response) : null;
			const msg = response?.message || err.message || "Network error";
			innerNotify(msg, "error");
			$this.disableForm(true);
		});
});

$("[data-close-funding]").on("click", (e) => {
	if (!confirm("Are you sure you want to close this fund raising?")) {
		return;
	}
	const elem = $(e.target);
	const url = elem.data("data-close-funding")[0];
	elem[0].disabled = true;
	$.ajax({
		url,
		method: "PATCH",
		headers: {
			"Content-Type": false,
		},
	})
		.then((res) => {
			alert(res);
			window.location.href = "/";
		})
		.catch((err) => {
			const response = err.response ? JSON.parse(err.response) : null;
			const msg = response?.message || err.message || "Network error";
			alert(msg);
			elem[0].disabled = true;
		});
});
