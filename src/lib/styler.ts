export type StylerModifier = {
    baseClasses?: string;
    mapClasses?: { [className: string]: boolean };
    toggleClasses?: [string, string, boolean][];
};

class StylerClassManager {
    tokens: { [classNames: string]: boolean } = {};

    private addClasses(classNames: string) {
        classNames.split(/\s+/).filter(x => !!x).forEach(x => this.tokens[x] = true);
    }

    addModifier({ baseClasses = "", mapClasses = {}, toggleClasses = [] }: StylerModifier) {
        this.addClasses(baseClasses);
        Object.keys(mapClasses).forEach(x => { if (mapClasses[x]) this.addClasses(x); });
        toggleClasses.forEach(([on, off, state]) => { if (state) { this.addClasses(on); } else { this.addClasses(off); } });
    }

    getClassName(styles: { [name: string]: string }) {
        return Object.keys(this.tokens).map(x => styles[x] || x).join(" ");
    }
}

export const styler = (styles: { [name: string]: string } = {}) => {
    return (baseClasses: string, mapClasses: { [className: string]: boolean } = {}, toggleClasses: [string, string, boolean][] = [], ...modifiers: StylerModifier[]) => {
        const manager = new StylerClassManager();
        manager.addModifier({
            baseClasses,
            mapClasses,
            toggleClasses
        });
        modifiers.forEach(manager.addModifier.bind(manager));
        return manager.getClassName(styles);
    };
};

export const s = styler();