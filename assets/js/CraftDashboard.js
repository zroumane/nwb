import "../css/CraftDashboard.scss";
import Modal from "bootstrap/js/dist/modal";
import { $q, $qa } from "./Global";
import { getMethod } from "./Utils";

const $categoryTemplate = $q("#categoryTemplate");
const $categorySection = $q("#categorySection");
const $categoryModal = $q("#categoryModal");
let categoryModal = new Modal($categoryModal, {});
const $addCategoryBtn = $q("#addCategoryBtn");
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
      body: JSON.stringify({
        category: $categoryModal.querySelector('input[type="text"]').value ?? "new_category",
        parent: "/api/item_categories/0",
      }),
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

const canDropCategroy = ($moveDiv) => {
  let draggedParentId = window.curentDragCategory.parent ? window.curentDragCategory.parent.split("/").reverse()[0] : 0;
  let rawTargetTree = $moveDiv.parentElement.dataset?.tree;
  let targetTree = rawTargetTree ? rawTargetTree.split("-") : [0];
  if (targetTree.includes(window.curentDragCategory.id.toString())) return false;
  if (draggedParentId == targetTree.reverse()[0])
    if (window.curentDragCategory.position == $moveDiv.dataset.position || window.curentDragCategory.position + 1 == $moveDiv.dataset.position) return false;
  return true;
};
/**
 * @param {HTMLElement} $moveDiv
 */
const setCategoryListener = ($moveDiv) => {
  $moveDiv.addEventListener("dragover", (event) => event.preventDefault());
  $moveDiv.addEventListener("dragenter", () => {
    if (!canDropCategroy($moveDiv)) return;
    $moveDiv.style.backgroundColor = "white";
    $moveDiv.parentElement.style.opacity = "0.7";
  });
  $moveDiv.addEventListener("dragleave", () => {
    $moveDiv.style.backgroundColor = "";
    $moveDiv.parentElement.style.opacity = "1";
  });
  $moveDiv.addEventListener("drop", (event) => {
    event.preventDefault();
    $moveDiv.style.backgroundColor = "";
    $moveDiv.parentElement.style.opacity = "1";
    if (!canDropCategroy($moveDiv)) return;
    let parent = $moveDiv.parentElement.dataset.id;
    if (window.confirm(`Move ${window.curentDragCategory.category} ${parent ? `under category ${parent}` : "to root"} and with position ${$moveDiv.dataset.position} ?`)) {
      fetch(`/api/item_categories/${window.curentDragCategory.id}`, {
        headers: { "Content-Type": "application/json" },
        method: "PUT",
        body: JSON.stringify({
          parent: "/api/item_categories/" + parent,
          position: parseInt($moveDiv.dataset.position),
        }),
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
  $categoryLabel.addEventListener("dragstart", () => (window.curentDragCategory = category));
  $categoryLabel.innerText = category.category;

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

  const $makeCategoryMove = ($parent, position) => {
    let $moveDiv = document.createElement("div");
    $moveDiv.classList.add("categoryMoveDiv");
    $moveDiv.dataset.position = position;
    setCategoryListener($moveDiv);
    $parent.appendChild($moveDiv);
  };

  let parentTree = $parent?.dataset.tree;
  let categoryTree = parentTree ? (parentTree += `-${category.id}`) : category.id.toString();
  $category.lastElementChild.dataset.tree = categoryTree;
  $category.lastElementChild.dataset.id = category.id;

  if ($parent && $parent.children.length === 0) $makeCategoryMove($parent, 0);
  if ($category.lastElementChild.children.length === 0) $makeCategoryMove($category.lastElementChild, 0);
  if ($categorySection.children.length == 0) $makeCategoryMove($categorySection, 0);

  $parent ? $parent.appendChild($category) : $categorySection.appendChild($category);
  $makeCategoryMove($parent ?? $categorySection, category.position + 1);
  category.children.forEach((c) => $makeCategory(c, $category.lastElementChild));
};

const getCategories = async () => {
  $categorySection.innerHTML = "";
  const root = await getMethod("/api/item_categories/0");
  console.log(root.children);
  root.children.forEach((category) => $makeCategory(category));
};

(async () => {
  getCategories();
  $addCategoryBtn.addEventListener("click", () => loadCategoryModal());
})();
