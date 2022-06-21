/* Class: Ship / 舰娘

 *******************************************************************

new Ship( Object data )
	data	原始数据

 *******************************************************************

ship instanceof Ship

ship.getName( joint, language )
	获取舰名
	变量
		joint		[OPTIONAL]
			String		连接符，如果存在后缀名，则在舰名和后缀名之间插入该字符串
			Boolean		如果为 true，则添加默认连接符
						如果为 false，则不添加连接符
			null		不添加连接符
		language	[OPTIONAL]
			String		语言代码，默认为 _g.lang
	返回值
		String		舰名 + 连接符（如果有） + 后缀名（如果有）
	快捷方式
		ship._name	默认连接符，默认语言

ship.getNameNoSuffix( language )
	获取舰名，不包括后缀
	变量
		language	[OPTIONAL]
			String		语言代码，默认为 _g.lang
	返回值
		String		舰名，不包括后缀

ship.getSuffix( language )
	获取后缀名
	变量
		language	[OPTIONAL]
			String		语言代码，默认为 _g.lang
	返回值
		String		后缀名

ship.getType( language )
	获取舰种
	变量
		language	[OPTIONAL]
			String		语言代码，默认为 _g.lang
	返回值
		String		舰种
	快捷方式
		ship._type	默认语言

ship.getSeriesData()
	获取系列数据
	返回值
		Object		系列

ship.getPic( picId )
	获取图鉴uri/path
	变量
		picId	[OPTIONAL]
			Number		图鉴Id，默认 0
	返回值
		String		uri/path
	快捷方式
		ship._pics	获取全部图鉴，Array

ship.getRel( relation )
	获取关系
	变量
		relation	[OPTIONAL]
			String		关系名
	返回值
		Object			如果没有给出 relation，返回关系对象
		String||Number	如果给出 relation，返回值，默认读取 rels 下的属性，如果不存在，读取上一个改造版本的对应关系

ship.getCV( language )
	获取声优
	变量
		language	[OPTIONAL]
			String		语言代码，默认为 _g.lang
	返回值
		String		声优名
	快捷方式
		ship._cv	默认语言

ship.getIllustrator( language )
	获取画师
	变量
		language	[OPTIONAL]
			String		语言代码，默认为 _g.lang
	返回值
		String		画师名
	快捷方式
		ship._illustrator	默认语言

 */

// const equipmentTypes = require("kckit/src/types/equipments");

class Ship extends ItemBase {
    constructor(data) {
        super();
        $.extend(true, this, data);
    }

    getName(joint, language) {
        joint = joint || "";
        language = language || _g.lang;
        let suffix = this.getSuffix(language);
        return (
            (this["name"][language] || this["name"]["ja_jp"]) +
            (suffix ? (joint === true ? _g.joint : joint) + suffix : "")
        );
    }

    getNameNoSuffix(language) {
        language = language || _g.lang;
        return this["name"][language] || this["name"]["ja_jp"];
    }

    getSuffix(language) {
        language = language || _g.lang;
        return this["name"].suffix
            ? _g.data["ship_namesuffix"][this["name"].suffix][language] ||
                  _g.data["ship_namesuffix"][this["name"].suffix]["ja_jp"] ||
                  ""
            : "";
    }

    getType(language) {
        language = language || _g.lang;
        return this["type"]
            ? _g["data"]["ship_types"][this["type"]].name.zh_cn
            : null;
    }
    get _type() {
        return this.getType();
    }

    getSeriesData() {
        return this["series"]
            ? _g["data"]["ship_series"][this["series"]]["ships"]
            : [
                  {
                      id: this.id,
                  },
              ];
    }

    getPic(picId) {
        let series = this.getSeriesData();
        picId = parseInt(picId || 0);

        let getURI = function (i, p) {
            if (
                typeof node != "undefined" &&
                node &&
                node.path &&
                _g.path.pics.ships
            )
                return node.path.join(
                    _g.path.pics.ships,
                    i + "/" + p + ".webp"
                );
            if (_g.path.pics.ships)
                return _g.path.pics.ships + i + "/" + p + ".png";
            return "/" + i + "/" + p + ".png";
        };

        for (let i = 0; i < series.length; i++) {
            if (series[i].id == this.id) {
                switch (picId) {
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                    case 12:
                    case 13:
                    case 14:
                        return getURI(this.id, picId);
                        break;
                    default:
                        if (series[i].illust_delete) {
                            return getURI(series[i - 1].id, picId);
                        } else {
                            return getURI(this.id, picId);
                        }
                        break;
                }
                break;
            }
        }
    }
    get _pics() {
        let arr = [];
        for (let i = 0; i < 15; i++) {
            arr.push(this.getPic(i));
        }
        return arr;
    }

    getSpeed(language) {
        language = language || _g.lang;
        return _g.statSpeed[parseInt(this.stat.speed)];
    }
    get _speed() {
        return this.getSpeed();
    }

    getRange(language) {
        language = language || _g.lang;
        return _g.statRange[parseInt(this.stat.range)];
    }
    get _range() {
        return this.getRange();
    }

    getEquipmentTypes() {
        return (_g.data.ship_types[this["type"]].equipable || [])
            .concat(this.additional_item_types || [])
            .sort(function (a, b) {
                return a - b;
            });
    }

    getAttribute(attr, lvl) {
        lvl = lvl || 1;
        if (lvl > Ship.lvlMax) lvl = Ship.lvlMax;

        let getStatOfLvl = function (lvl, base, max) {
            lvl = lvl || 1;
            base = parseFloat(base);
            max = parseFloat(max) || base;
            if (base < 0 || max < 0) return -1;
            if (base == max) return max;
            return Math.floor(base + ((max - base) * lvl) / 99);
        };

        let value;

        switch (attr) {
            case "hp":
                value = this["stat"]["hp"];
                if (lvl > 99) {
                    if (this["stat"]["hp"] >= 90)
                        value = this["stat"]["hp"] + 9;
                    else if (this["stat"]["hp"] >= 70)
                        value = this["stat"]["hp"] + 8;
                    else if (this["stat"]["hp"] >= 50)
                        value = this["stat"]["hp"] + 7;
                    else if (this["stat"]["hp"] >= 40)
                        value = this["stat"]["hp"] + 6;
                    else if (this["stat"]["hp"] >= 30)
                        value = this["stat"]["hp"] + 5;
                    else value = this["stat"]["hp"] + 4;
                    if (value > this["stat"]["hp_max"])
                        value = this["stat"]["hp_max"];
                }
                return value;
                break;
            case "speed":
                return _g.getStatSpeed(this["stat"]["speed"]);
                break;
            case "range":
                return _g.getStatRange(this["stat"]["range"]);
                break;
            case "luck":
                if (lvl > 99) return this["stat"]["luck"] + 3;
                return this["stat"]["luck"];
                break;
            case "fuel":
            case "ammo":
                if (lvl > 99) return Math.floor(this["consum"][attr] * 0.85);
                return this["consum"][attr];
                break;
            case "aa":
            case "armor":
            case "fire":
            case "torpedo":
                return this["stat"][attr + "_max"] || this["stat"][attr];
                break;
            default:
                return getStatOfLvl(
                    lvl,
                    this["stat"][attr],
                    this["stat"][attr + "_max"]
                );
                break;
        }
    }

    getRel(relation) {
        if (relation) {
            if (!this.rels[relation] && this.remodel && this.remodel.prev) {
                let prev = _g.data.ships[this.remodel.prev];
                while (prev) {
                    if (prev.rels && prev.rels[relation])
                        return prev.rels[relation];
                    if (!prev.remodel || !prev.remodel.prev) prev = null;
                    else prev = _g.data.ships[prev.remodel.prev];
                }
            }
            return this.rels[relation];
        } else {
            return this.rels;
        }
    }

    getCV(language) {
        let entity = this.getRel("cv");
        if (entity)
            return _g.data.entities[entity].getName(language || _g.lang);
        return;
    }
    get _cv() {
        return this.getCV();
    }

    getIllustrator(language) {
        let entity = this.getRel("illustrator");
        if (entity)
            return _g.data.entities[entity].getName(language || _g.lang);
        return;
    }
    get _illustrator() {
        return this.getIllustrator();
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

    // /**
    //  * 判断该舰娘是否可配置给定的类型的装备
    //  *
    //  * @param {(number|number[]|string|string[])} equipmentType 装备类型，如果为 Array，会判断是否满足所有条件
    //  * @param {Number|Boolean} [slotIndex] 装备栏位index。从 0 开始。如果为 true，则检查所有栏位
    //  * @returns {boolean}
    //  */
    // canEquip(equipmentType, slotIndex) {
    //     if (Array.isArray(equipmentType)) {
    //         return equipmentType.every((type) =>
    //             this.canEquip(type, slotIndex)
    //         );
    //     }

    //     // 如果 equipmentType 为 String，将其转为对应的类型数字或类型集
    //     if (typeof equipmentType === "string") {
    //         if (Array.isArray(equipmentTypes[equipmentType]))
    //             return equipmentTypes[equipmentType].some((type) =>
    //                 this.canEquip(type, slotIndex)
    //             );
    //         if (typeof equipmentTypes[equipmentType] === "number")
    //             return this.canEquip(equipmentTypes[equipmentType], slotIndex);
    //         if (Array.isArray(equipmentTypes[equipmentType + "s"]))
    //             return equipmentTypes[equipmentType + "s"].some((type) =>
    //                 this.canEquip(type, slotIndex)
    //             );
    //     }

    //     // 如果equipmentType 为 Equipment，获取 type
    //     if (
    //         typeof equipmentType === "object" &&
    //         typeof equipmentType.type !== "undefined"
    //     )
    //         equipmentType = equipmentType.type;

    //     if (isNaN(equipmentType)) {
    //         return false;
    //     } else {
    //         return this.getEquipmentTypes(slotIndex).includes(
    //             parseInt(equipmentType)
    //         );
    //     }
    // }
}

Ship.lvlMax = 155;
