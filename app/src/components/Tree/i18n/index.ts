// English translations
export const treeEnTranslations = {
    tree: {
        addRoot: "Add Root Folder",
        create: "Create",
        edit: "Edit",
        delete: "Delete",
        deleteConfirmTitle: "Confirm Deletion",
        deleteConfirmMessage: "Are you sure you want to delete '{{name}}'? This action cannot be undone.",
        newNodeNamePlaceholder: "Enter name...",
        move: "Move",
        copy: "Copy",
        confirmButton: "Confirm",
        cancelButton: "Cancel"
    }
};

// Korean translations
export const treeKoTranslations = {
    tree: {
        addRoot: "루트 폴더 추가",
        create: "생성",
        edit: "편집",
        delete: "삭제",
        deleteConfirmTitle: "삭제 확인",
        deleteConfirmMessage: "'{{name}}'을(를) 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.",
        newNodeNamePlaceholder: "이름 입력...",
        move: "이동",
        copy: "복사",
        confirmButton: "확인",
        cancelButton: "취소"
    }
};

// Export combined translations
export const treeTranslations = {
    en: treeEnTranslations,
    ko: treeKoTranslations
};

export default treeTranslations;