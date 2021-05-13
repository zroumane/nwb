import "../css/weapon.scss";
import { $q, $qa } from "./global";

const $weaponSelect = $q("#weaponSelect");
const $createWeaponForm = $q("#createWeapon");

function getWeapon() {
	fetch("/api/weapons")
		.then((response) => response.json())
		.then((data) => {
			Array.from($q("#weaponSelect").children)
				.filter((c) => c.value != 0)
				.forEach((c) => c.remove());
			window.weapons = data["hydra:member"];
			window.weapons.forEach((weapon) => {
				var $weaponOption = document.createElement("option");
				$weaponOption.value = weapon.id;
				$weaponOption.innerText = weapon.weaponKey;
				$weaponSelect.appendChild($weaponOption);
			});
			Array.from($weaponSelect.children).filter((c) => c.value == 0)[0].selected = true;
			fillCreateForm(["", "", ""]);
		});
}

$weaponSelect.addEventListener("change", () => {
	var selectedValue = $weaponSelect.value;
	if (selectedValue == 0) var data = ["", "", ""];
	else {
		var selectedWeaponData = window.weapons.filter((w) => w.id == selectedValue)[0];
		var data = [selectedWeaponData.weaponKey, selectedWeaponData.branch[0], selectedWeaponData.branch[1]];
	}
	fillCreateForm(data);
});

function fillCreateForm(data) {
	$createWeaponForm.querySelector('input[data-type="wkey"]').value = data[0];
	$createWeaponForm.querySelector('input[data-type="b1key"]').value = data[1];
	$createWeaponForm.querySelector('input[data-type="b2key"]').value = data[2];
	$q("#branchName-1").innerText = data[1];
	$q("#branchName-2").innerText = data[2];
}

$qa(".weaponAction").forEach((btn) => {
	btn.addEventListener("click", () => {
		var fetchObject = {
			headers: {
				"content-Type": "application/json",
			},
		};

		var selectedValue = "" ? $weaponSelect.value == 0 : "/" + $weaponSelect.value;

		if (btn.getAttribute("data-type") == "delete") {
			if (selectedValue == "") return;
			else fetchObject.method = "DELETE";
		} else {
			if (btn.getAttribute("data-type") == "submit")
				if ($weaponSelect.value != 0) fetchObject.method = "PUT";
				else fetchObject.method = "POST";

			fetchObject.body = JSON.stringify({
				weaponKey: $createWeaponForm.querySelector('input[data-type="wkey"]').value,
				branch: [
					$createWeaponForm.querySelector('input[data-type="b1key"]').value,
					$createWeaponForm.querySelector('input[data-type="b2key"]').value,
				],
			});
		}

		fetch(`/api/weapons${selectedValue}`, fetchObject).then((response) => {
			if (200 <= response.status && response.status < 300) getWeapon();
		});
	});
});

getWeapon();

$qa(".skill-container").forEach((skillContainer) => {
	skillContainer.addEventListener("click", () => {
		var data = skillContainer.id.split("-");
		var side = data[1];
		var row = data[2];
		var col = data[3];
	});
});
