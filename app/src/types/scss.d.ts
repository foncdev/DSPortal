// src/types/scss.d.ts
declare module '*.scss' {
    const content: Record<string, string>;
    export default content;
}

declare module '*.css' {
    const content: Record<string, string>;
    export default content;
}

declare module '*.sass' {
    const content: Record<string, string>;
    export default content;
}

declare module '*.less' {
    const content: Record<string, string>;
    export default content;
}

// For styles from the node_modules
declare module '*.module.css' {
    const classes: Record<string, string>;
    export default classes;
}

declare module '*.module.scss' {
    const classes: Record<string, string>;
    export default classes;
}

declare module '*.module.sass' {
    const classes: Record<string, string>;
    export default classes;
}