import { set as $ } from "../../../node_modules/set/src/index.js";
import { innerNotify } from "../modules.js";

// login form
$("form").on("submit", function (e) {
	e.preventDefault();
	const $this = $(this);
	innerNotify();
	let inputs = new FormData();
  inputs.append("image", $("#createFundingForm [name=image]")[0].files[0]);
  inputs.append("title", $("#createFundingForm [name=title]")[0].value.trim());
  inputs.append("description", $("#createFundingForm [name=description]")[0].value.trim());
  inputs.append("accountNumber", $("#createFundingForm [name=accountNumber]")[0].value.trim());
  inputs.append("bankName", $("#createFundingForm [name=bankName]")[0].value.trim());
	$this.disableForm();
	$.ajax({
		url: $this.attr("action")[0],
		method: $this.attr("method")[0],
		body: inputs,
		headers: {
			"Content-Type": false,
		},
	})
		.then((res) => {
			innerNotify(res, "success");
			window.location.href = "/";
		})
		.catch((err) => {
			const response = err.response ? JSON.parse(err.response) : null;
			const msg = response?.message || err.message || "Network error";
			innerNotify(msg, "error");
			$this.disableForm(true);
		});
});
