class Ship extends ITEM {
    constructor(data) {
        super();
        $.extend(true, this, data);
    }

    getName(joint, language) {
        joint = joint || "";
        language = language || _g.lang;
        return (
            (this["name"][language] || this["name"]["ja_jp"]) +
            (this["name"].suffix
                ? (joint === true ? _g.joint : joint) +
                  (_g.data["ship_namesuffix"][this["name"].suffix][language] ||
                      _g.data["ship_namesuffix"][this["name"].suffix]["ja_jp"])
                : "")
        );
    }

    getType(language) {
        language = language || _g.lang;
        return this["type"]
            ? _g["data"]["ship_types"][this["type"]].name.zh_cn
            : null;
    }

    getSeriesData() {
        return this["series"]
            ? _g["data"]["ship_series"][this["series"]]["ships"]
            : [];
    }

    /**
     * 获取所属海军简称
     *
     * @readonly
     * @returns {String}
     */
    getNavy() {
        if (this.navy) return this.navy;
        return this.class
            ? _g["data"].ship_classes[this.class].navy || "ijn"
            : "ijn";
    }
    get _navy() {
        return this.getNavy();
    }
}
