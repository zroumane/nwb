import "../css/CraftDashboard.scss";
import Modal from "bootstrap/js/dist/modal";
import { $q, $qa } from "./Global";
import { getMethod } from "./Utils";

const $categoryTemplate = $q("#categoryTemplate");
const $categorySection = $q("#categorySection");
const $categoryModal = $q("#categoryModal");
let categoryModal = new Modal($categoryModal, {});
const $addCategoryBtn = $q("#addCategoryBtn");
const $categoryRoot = $q("#categoryRoot");
window.currentCategory = null;

const loadCategoryModal = (category) => {
  categoryModal.hide();
  $categoryModal.querySelector(".modal-title").innerText = category ? "Edit Category " + category.id : "Create Category";
  $categoryModal.querySelector('input[type="text"]').value = category?.category ?? "";
  let $sendBtn = $categoryModal.querySelector("button.btn-primary");
  $sendBtn.lastElementChild.innerText = category ? "Edit" : "Create";
  $sendBtn.onclick = null;
  $sendBtn.onclick = () => {
    $sendBtn.classList.add("disabled");
    $sendBtn.firstElementChild.classList.remove("d-none");
    fetch(`/api/item_categories${category ? `/${category.id}` : ""}`, {
      headers: { "Content-Type": "application/json" },
      method: category ? "PUT" : "POST",
      body: JSON.stringify({ category: $categoryModal.querySelector('input[type="text"]').value ?? "new_category" }),
    }).then(() => {
      getCategories().then(() => {
        categoryModal.hide();
        $sendBtn.classList.remove("disabled");
        $sendBtn.firstElementChild.classList.add("d-none");
      });
    });
  };
  categoryModal.show();
};

/**
 * @param {HTMLElement} $category
 * @param {object} category
 * @param {string} categoryTree
 */
const setCategoryListener = ($category, category, categoryTree) => {
  if (category) $category.addEventListener("dragstart", () => (window.curentDragCategory = category));
  $category.addEventListener("dragover", (event) => event.preventDefault());
  $category.addEventListener("dragenter", (event) => {
    if (window.curentDragCategory === event.target.parentElement) return;
    $category.style.backgroundColor = "white";
  });
  $category.addEventListener("dragleave", (event) => {
    if (window.curentDragCategory === event.target.parentElement) return;
    $category.style.backgroundColor = "";
  });
  $category.addEventListener("drop", (event) => {
    event.preventDefault();
    $category.style.backgroundColor = "";

    if (window.curentDragCategory.id == category?.id) return;
    if (category && category.children.find((c) => c.id == window.curentDragCategory.id)) return;
    if (categoryTree && categoryTree.split("-").includes(window.curentDragCategory.id.toString())) return;
    if (window.confirm(`Move ${window.curentDragCategory.category} ${category ? `under ${category.category}` : "to root"} ?`)) {
      fetch(`/api/item_categories/${window.curentDragCategory.id}`, {
        headers: { "Content-Type": "application/json" },
        method: "PUT",
        body: JSON.stringify({ parent: category ? category["@id"] : null }),
      }).then(() => getCategories());
    }
  });
};

/**
 * @param {Object} category
 * @param {HTMLElement} $parent
 */
const $makeCategory = (category, $parent) => {
  let $category = $categoryTemplate.content.cloneNode(true).firstElementChild;
  let $categoryLabel = $category.firstElementChild.firstElementChild;
  $categoryLabel.innerText = category.category;
  let parentTree = $parent?.parentElement?.dataset.tree;
  let categoryTree = parentTree ? (parentTree += `-${category.id}`) : category.id.toString();
  $category.dataset.tree = categoryTree;

  setCategoryListener($categoryLabel, category, categoryTree);

  let $actions = $category.firstElementChild.children;
  $actions[2].addEventListener("click", () => {
    loadCategoryModal(category);
  });
  $actions[3].addEventListener("click", async () => {
    if (window.confirm(`Delete ${category.category}`)) {
      fetch(`/api/item_categories/${category.id}`, { method: "DELETE" }).then(() => {});
      getCategories();
    }
  });

  $parent ? $parent.appendChild($category) : $categorySection.appendChild($category);
  category.children.forEach((c) => $makeCategory(c, $category.lastElementChild));
};

const getCategories = async () => {
  $categorySection.innerHTML = "";
  const categories = (await getMethod("/api/item_categories"))["hydra:member"];
  categories.forEach((category) => $makeCategory(category));
};

(async () => {
  getCategories();
  $addCategoryBtn.addEventListener("click", () => loadCategoryModal());
  setCategoryListener($categoryRoot);
})();
