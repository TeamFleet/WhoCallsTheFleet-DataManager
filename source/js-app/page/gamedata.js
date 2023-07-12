// http://203.104.209.23/kcs/...

// ship types -> database
const sTypesMap = {};
// ship class -> database
const cTypesMap = {};

_frame.app_main.page["gamedata"] = {};
_frame.app_main.page["gamedata"].init = function (page) {
    jf.readFile(
        node.path.join(_g.root, "/fetched_data/api_start2.json"),
        function (err, obj) {
            if (err) return false;

            page.empty();
            _frame.app_main.page["gamedata"].tabview = $(
                '<div class="tabview"/>'
            ).appendTo(page);

            _frame.app_main.page["gamedata"].data = obj["api_data"];

            for (var i in obj["api_data"]) {
                var item = i.replace("api_mst_", "");
                if (_frame.app_main.page["gamedata"]["init_" + item])
                    _frame.app_main.page["gamedata"]["init_" + item](
                        obj["api_data"][i]
                    );
            }

            obj.api_data.api_mst_stype.forEach((api_stype) => {
                if (!sTypesMap[api_stype.api_id])
                    sTypesMap[api_stype.api_id] = [];
                const types = Object.values(_g.data.ship_types).filter(
                    ({ id_ingame }) => `${id_ingame}` === `${api_stype.api_id}`
                );
                // console.log({ stype: api_stype.api_id, types });
                sTypesMap[api_stype.api_id] = types.map(({ id }) => id);
            });

            obj.api_data.api_mst_ship.forEach((api_ship) => {
                const ctype = api_ship.api_ctype;
                if (Array.isArray(cTypesMap[ctype])) return;
                console.log(ctype, api_ship);
                const types = Object.values(_g.data.ship_classes).filter(
                    ({ id_ingame }) => `${id_ingame}` === `${ctype}`
                );
                // console.log({ stype: api_stype.api_id, types });
                cTypesMap[ctype] = types.map(({ id }) => id);
            });

            console.log(obj, sTypesMap, cTypesMap);

            _p.initDOM(page);
        }
    );
};

_frame.app_main.page["gamedata"].init_ship = function (data) {
    var section = $('<section class="list" data-tabname="Ships"/>').appendTo(
        this.tabview
    );
    var enable_proxy = false;
    //console.log(data)

    /*
        基本信息
            id 			ID
            name 		名
            yomi 		假名
            stype		舰种
                        2	驱逐舰
                        3	轻巡洋舰
                        7	轻航母
            sortno 		图鉴ID
            buildtime	建造时长
            getmes		入手台词
            backs		卡背级别
                        3	睦月
                        4	深雪改
                        5	筑摩改
                        6	能代改
        属性
            houg		火力	初始, 最大
            raig		雷装	初始, 最大
            tyku		对空	初始, 最大
            taik		耐久	初始, 最大
            souk		装甲	初始, 最大
            soku 		航速
                        5	慢
                        10	快
            leng		射程
                        1 	短
                        2 	中
                        3	长
                        4 	超长
            luck		运		初始, 最大
        消耗
            fuel_max	燃料
            bull_max	弹药
        装备 & 搭载
            slot_num 	搭载格数
            maxeq		每格搭载量
        改造
            afterlv		改造等级
            aftershipid	改造后ID
            afterfuel	消耗燃料
            afterbull	消耗弹药
        解体
            broken 		ARRAY 解体资源
        合成
            powup 		ARRAY 合成提高属性
        未知
            voicef		睦月		0
                        深雪改		1
                        能代改		3
    */

    // 遍历 api_mst_shipgraph，做出文件名和ID对应表
    var filename_map = {};
    for (var i in this.data["api_mst_shipgraph"]) {
        filename_map[this.data["api_mst_shipgraph"][i]["api_id"]] = {
            filename: this.data["api_mst_shipgraph"][i]["api_filename"],
            version: parseInt(this.data["api_mst_shipgraph"][i]["api_version"]),
        };
    }
    console.log(filename_map);

    // 按钮 & 功能: 下载全部舰娘数据文件
    $('<button type="button"/>')
        .html("下载全部数据文件")
        .on("click", function () {
            var promise_chain = Q.fcall(function () {}),
                folder = node.path.join(_g.root, "/fetched_data/ships_raw/"),
                folder_pics = node.path.join(
                    _g.root,
                    "/fetched_data/ships_pic/"
                ),
                version_file = node.path.join(folder, "_.json"),
                version_last = {};

            function _log(msg) {
                console.log(msg);
            }

            // 开始异步函数链
            promise_chain

                // 检查并创建工作目录
                .then(function () {
                    var deferred = Q.defer();
                    node.mkdirp(folder, function (err) {
                        if (err) {
                            _log("创建目录失败 " + folder);
                            deferred.reject(new Error(err));
                        } else {
                            _log("已确保目录 " + folder);
                            deferred.resolve();
                        }
                    });
                    return deferred.promise;
                })
                .then(function () {
                    var deferred = Q.defer();
                    node.mkdirp(folder_pics, function (err) {
                        if (err) {
                            _log("创建目录失败 " + folder_pics);
                            deferred.reject(new Error(err));
                        } else {
                            _log("已确保目录 " + folder_pics);
                            deferred.resolve();
                        }
                    });
                    return deferred.promise;
                })

                // 读取之前的版本号
                .then(function () {
                    var deferred = Q.defer();
                    jf.readFile(version_file, function (err, obj) {
                        version_last = obj || {};
                        deferred.resolve();
                    });
                    return deferred.promise;
                })

                // 遍历舰娘数据
                .then(function () {
                    _log("开始遍历舰娘数据");
                    var count = 0,
                        max =
                            _frame.app_main.page["gamedata"].data[
                                "api_mst_ship"
                            ].length;
                    _frame.app_main.page["gamedata"].data[
                        "api_mst_ship"
                    ].forEach(function (data) {
                        (function (data) {
                            promise_chain = promise_chain.then(function () {
                                var deferred = Q.defer(),
                                    file = node.url.parse(
                                        "http://" +
                                            server_ip +
                                            "/kcs/resources/swf/ships/" +
                                            filename_map[data["api_id"]][
                                                "filename"
                                            ] +
                                            ".swf"
                                    ),
                                    filename =
                                        data["api_id"] +
                                        " - " +
                                        data["api_name"] +
                                        ".swf",
                                    file_local = node.path.join(
                                        folder,
                                        data["api_id"] + ".swf"
                                    ),
                                    file_local_rename = node.path.join(
                                        folder,
                                        filename
                                    ),
                                    folder_export = node.path.join(
                                        folder_pics,
                                        "\\" + data["api_id"]
                                    ),
                                    stat = null,
                                    version =
                                        filename_map[data["api_id"]][
                                            "version"
                                        ] || 0,
                                    skipped = false,
                                    statusCode = null;

                                try {
                                    var stat =
                                        node.fs.lstatSync(file_local_rename);
                                    if (!stat || !stat.isFile()) {
                                        stat = null;
                                    }
                                } catch (e) {}

                                _log(
                                    "========== " +
                                        count +
                                        "/" +
                                        max +
                                        " =========="
                                );
                                _log(
                                    "    [" +
                                        data["api_id"] +
                                        "] " +
                                        data["api_name"] +
                                        " | 服务器版本: " +
                                        version +
                                        " | 本地版本: " +
                                        (version_last[data["api_id"]] || "无")
                                );

                                if (
                                    stat &&
                                    version <=
                                        (version_last[data["api_id"]] || -1)
                                ) {
                                    skipped = true;
                                    _log("    本地版本已最新，跳过");
                                    count++;
                                    deferred.resolve();
                                } else {
                                    _log("    开始获取: " + file.href);
                                    version_last[data["api_id"]] = version;

                                    Q.fcall(function () {})

                                        // 向服务器请求 swf 文件
                                        .then(function () {
                                            var deferred2 = Q.defer();
                                            request({
                                                uri: file,
                                                method: "GET",
                                                proxy: enable_proxy
                                                    ? proxy
                                                    : null,
                                            })
                                                .on("error", function (err) {
                                                    deferred2.reject(
                                                        new Error(err)
                                                    );
                                                })
                                                .on(
                                                    "response",
                                                    function (response) {
                                                        statusCode =
                                                            response.statusCode;
                                                    }
                                                )
                                                .pipe(
                                                    node.fs
                                                        .createWriteStream(
                                                            file_local
                                                        )
                                                        .on(
                                                            "finish",
                                                            function () {
                                                                _log(
                                                                    "    文件已保存: " +
                                                                        data[
                                                                            "api_id"
                                                                        ] +
                                                                        " - " +
                                                                        data[
                                                                            "api_name"
                                                                        ] +
                                                                        ".swf"
                                                                );
                                                                count++;
                                                                jf.writeFile(
                                                                    version_file,
                                                                    version_last,
                                                                    function (
                                                                        err
                                                                    ) {
                                                                        if (
                                                                            err
                                                                        ) {
                                                                            deferred2.reject(
                                                                                new Error(
                                                                                    err
                                                                                )
                                                                            );
                                                                        } else {
                                                                            _log(
                                                                                "    版本文件已更新"
                                                                            );
                                                                            deferred2.resolve();
                                                                        }
                                                                    }
                                                                );
                                                                if (
                                                                    statusCode !=
                                                                        200 ||
                                                                    data[
                                                                        "api_name"
                                                                    ] == "なし"
                                                                ) {
                                                                    skipped = true;
                                                                }
                                                            }
                                                        )
                                                );
                                            return deferred2.promise;
                                        })

                                        // 反编译 swf
                                        .then(function () {
                                            var deferred2 = Q.defer();
                                            if (skipped) {
                                                deferred2.resolve();
                                            } else {
                                                _log("    开始反编译 SWF");
                                                var exec =
                                                        node.require(
                                                            "child_process"
                                                        ).exec,
                                                    child;

                                                node.mkdirp.sync(folder_export);
                                                _log(
                                                    "    目录已确保 " +
                                                        folder_export
                                                );

                                                child = exec(
                                                    "java -jar .\\app\\assets\\FFDec\\ffdec.jar" +
                                                        " -format image:png" +
                                                        " -export image " +
                                                        folder_export +
                                                        " " +
                                                        file_local,
                                                    function (
                                                        err,
                                                        stdout,
                                                        stderr
                                                    ) {
                                                        _log(
                                                            "    stdout: " +
                                                                stdout
                                                        );
                                                        _log(
                                                            "    stderr: " +
                                                                stderr
                                                        );
                                                        if (err !== null) {
                                                            _log(
                                                                "    exec error: " +
                                                                    err
                                                            );
                                                            deferred2.reject(
                                                                new Error(err)
                                                            );
                                                        } else {
                                                            _log(
                                                                "    SWF 反编译完成"
                                                            );
                                                            deferred2.resolve();
                                                        }
                                                    }
                                                );
                                            }
                                            return deferred2.promise;
                                        })

                                        // 如果执行了 swf 反编译，整理反编译结果
                                        .then(function () {
                                            var deferred2 = Q.defer();
                                            if (skipped) {
                                                deferred2.resolve();
                                            } else {
                                                node.fs.readdir(
                                                    folder_export,
                                                    function (err, files) {
                                                        if (err) {
                                                            deferred2.reject(
                                                                new Error(err)
                                                            );
                                                        } else {
                                                            deferred2.resolve(
                                                                files
                                                            );
                                                        }
                                                    }
                                                );
                                            }
                                            return deferred2.promise;
                                        })
                                        .then(function (files) {
                                            var chain2 = Q.fcall(
                                                    function () {}
                                                ),
                                                deferred2 = Q.defer(),
                                                count2 = 0;

                                            files = files || [];
                                            files = files.sort(function (a, b) {
                                                var name_a =
                                                        parseInt(a) || -999,
                                                    name_b =
                                                        parseInt(b) || -999;
                                                return name_a - name_b;
                                            });

                                            if (files.length) {
                                                files.forEach(function (
                                                    _filename
                                                ) {
                                                    (function (
                                                        _filename,
                                                        count2
                                                    ) {
                                                        chain2 = chain2.then(
                                                            function () {
                                                                var deferred3 =
                                                                        Q.defer(),
                                                                    parsed =
                                                                        node.path.parse(
                                                                            _filename
                                                                        ),
                                                                    new_name =
                                                                        Math.floor(
                                                                            parseInt(
                                                                                parsed[
                                                                                    "name"
                                                                                ]
                                                                            ) /
                                                                                2
                                                                        ) +
                                                                        parsed[
                                                                            "ext"
                                                                        ].toLowerCase(),
                                                                    _path =
                                                                        node.path.join(
                                                                            folder_export,
                                                                            _filename
                                                                        );
                                                                if (
                                                                    node.fs
                                                                        .lstatSync(
                                                                            _path
                                                                        )
                                                                        .isFile()
                                                                ) {
                                                                    node.fs.rename(
                                                                        _path,
                                                                        node.path.join(
                                                                            folder_export,
                                                                            new_name
                                                                        ),
                                                                        function (
                                                                            err
                                                                        ) {
                                                                            if (
                                                                                err !==
                                                                                null
                                                                            ) {
                                                                                deferred3.reject(
                                                                                    new Error(
                                                                                        err
                                                                                    )
                                                                                );
                                                                            } else {
                                                                                _log(
                                                                                    "    反编译: " +
                                                                                        new_name
                                                                                );
                                                                                deferred3.resolve();
                                                                            }
                                                                            if (
                                                                                count2 >=
                                                                                files.length -
                                                                                    1
                                                                            ) {
                                                                                deferred2.resolve();
                                                                            }
                                                                        }
                                                                    );
                                                                } else {
                                                                    deferred3.resolve();
                                                                    if (
                                                                        count2 >=
                                                                        files.length -
                                                                            1
                                                                    ) {
                                                                        deferred2.resolve();
                                                                    }
                                                                }
                                                            }
                                                        );
                                                    })(_filename, count2);
                                                    count2++;
                                                });
                                            } else {
                                                deferred2.resolve();
                                            }

                                            return deferred2.promise;
                                        })

                                        // 重命名本地 swf
                                        .then(function () {
                                            var deferred2 = Q.defer();
                                            node.fs.rename(
                                                file_local,
                                                file_local_rename,
                                                function (err) {
                                                    if (err !== null) {
                                                        deferred2.reject(
                                                            new Error(err)
                                                        );
                                                    } else {
                                                        _log(
                                                            "    SWF 文件重命名为 " +
                                                                filename
                                                        );
                                                        deferred2.resolve();
                                                    }
                                                }
                                            );
                                            return deferred2.promise;
                                        })
                                        .catch(function (err) {
                                            _log(err);
                                            deferred.reject(new Error(err));
                                        })
                                        .done(function () {
                                            deferred.resolve();
                                        });
                                }

                                return deferred.promise;
                            });
                        })(data);
                    });
                    return true;
                })

                // 错误处理
                .catch(function (err) {
                    _log(err);
                })
                .done(function () {
                    _log("ALL DONE");
                });
        })
        .appendTo(section);

    // 按钮 & 功能: 根据游戏数据更新舰娘数据库
    $('<button type="button"/>')
        .html("更新舰娘数据库")
        .on("click", function () {
            var promise_chain = Q.fcall(function () {});

            function _log(msg) {
                console.log(msg);
            }

            // 开始异步函数链
            promise_chain

                // 获取全部 _id & id
                .then(function () {
                    var deferred = Q.defer();
                    _db.ships.find({}, function (err, docs) {
                        if (err) {
                            deferred.reject(err);
                        } else {
                            var d = {};
                            for (var i in docs) {
                                d[docs[i].id] = docs[i]._id;
                            }
                            deferred.resolve(d);
                        }
                    });
                    return deferred.promise;
                })

                // 更新数据
                .then(function (map) {
                    _log(map);
                    _log("开始遍历舰娘数据");

                    var count = 0,
                        max =
                            _frame.app_main.page["gamedata"].data[
                                "api_mst_ship"
                            ].length;

                    _frame.app_main.page["gamedata"].data[
                        "api_mst_ship"
                    ].forEach(function (data) {
                        (function (data) {
                            function _done(cur) {
                                if (cur >= max) {
                                    promise_chain.fin(function () {
                                        _log("遍历舰娘数据完成");
                                    });
                                }
                            }
                            promise_chain = promise_chain.then(function () {
                                var deferred = Q.defer();
                                if (map[data.api_id]) {
                                    _log(
                                        "    [" +
                                            data.api_id +
                                            "] " +
                                            data.api_name +
                                            " 开始处理"
                                    );
                                    count++;

                                    let modified = {},
                                        unset = {};
                                    // base
                                    modified["no"] = data["api_sortno"];
                                    modified["buildtime"] =
                                        data["api_buildtime"];
                                    modified["lines.start"] =
                                        data["api_getmes"];
                                    modified["rare"] = data["api_backs"];
                                    // stat
                                    modified["stat.fire"] = data["api_houg"][0];
                                    modified["stat.fire_max"] =
                                        data["api_houg"][1];
                                    modified["stat.torpedo"] =
                                        data["api_raig"][0];
                                    modified["stat.torpedo_max"] =
                                        data["api_raig"][1];
                                    modified["stat.aa"] = data["api_tyku"][0];
                                    modified["stat.aa_max"] =
                                        data["api_tyku"][1];
                                    modified["stat.hp"] = data["api_taik"][0];
                                    modified["stat.hp_max"] =
                                        data["api_taik"][1];
                                    modified["stat.armor"] =
                                        data["api_souk"][0];
                                    modified["stat.armor_max"] =
                                        data["api_souk"][1];
                                    modified["stat.speed"] = data["api_soku"];
                                    modified["stat.range"] = data["api_leng"];
                                    modified["stat.luck"] = data["api_luck"][0];
                                    modified["stat.luck_max"] =
                                        data["api_luck"][1];
                                    // consum
                                    modified["consum.fuel"] =
                                        data["api_fuel_max"];
                                    modified["consum.ammo"] =
                                        data["api_bull_max"];
                                    // slot
                                    var i = 0;
                                    modified["slot"] = [];
                                    while (
                                        i <
                                        (parseInt(data["api_slot_num"]) || 0)
                                    ) {
                                        modified["slot"].push(
                                            data["api_maxeq"][i] || 0
                                        );
                                        i++;
                                    }
                                    // remodel
                                    //modified['remodel_cost.fuel']	= data['api_afterfuel']
                                    modified["remodel_cost.ammo"] =
                                        data["api_afterbull"];
                                    modified["remodel_cost.steel"] =
                                        data["api_afterfuel"];
                                    unset["remodel_cost.fuel"] = true;
                                    // extra slot extra equipable ids -> equipment init
                                    // misc
                                    modified["scrap"] = data["api_broken"];
                                    modified["modernization"] =
                                        data["api_powup"];
                                    modified["time_modified"] = _g.timeNow();

                                    _log(modified);
                                    _db.ships.update(
                                        {
                                            _id: map[data["api_id"]],
                                        },
                                        {
                                            $set: modified,
                                            $unset: unset,
                                        },
                                        function () {
                                            deferred.resolve();
                                            _done(count);
                                        }
                                    );
                                } else {
                                    _log(
                                        "    [" +
                                            data.api_id +
                                            "] " +
                                            data.api_name +
                                            " 不存在于数据库，跳过"
                                    );
                                    count++;
                                    deferred.resolve();
                                    _done(count);
                                }
                                return deferred.promise;
                            });
                        })(data);
                    });
                    return true;
                })

                // 错误处理
                .catch(function (err) {
                    _log(err);
                })
                .done(function () {
                    _log("ALL DONE");
                });
        })
        .appendTo(section);

    // 选项：代理
    var _enable_proxy = $('<input name="enable_proxy" type="checkbox" />');
    $("<label/>")
        .append(
            _enable_proxy.on("change", function () {
                enable_proxy = _enable_proxy.prop("checked");
            })
        )
        .append($("<span>使用代理</span>"))
        .appendTo(section);
};

_frame.app_main.page["gamedata"].init_slotitem = function (data) {
    var section = $(
        '<section class="list" data-tabname="Equipments"/>'
    ).appendTo(this.tabview);

    // 按钮 & 功能: 根据游戏数据更新舰娘数据库
    $('<button type="button"/>')
        .html("更新装备数据库")
        .on("click", function () {
            let promise_chain = Q.fcall(function () {}),
                thisDb = _db.items;

            const { api_data: api_data } = _g.getGameApi();
            const {
                api_mst_equip_exslot,
                api_mst_equip_exslot_ship,
                api_mst_slotitem,
            } = api_data;

            console.log(api_data);

            function _log(msg) {
                console.log(msg);
            }

            _log("");
            _log("更新装备数据库");

            // 开始异步函数链
            promise_chain

                // 更新数据 - 所有装备类型
                // 获取装备类型数据
                .then(() => {
                    console.log("丨");
                    console.log("丨 处理装备类型");
                    console.log(
                        "丨 > 补强增设栏位装备类型",
                        api_mst_equip_exslot
                    );
                    console.log("丨 > 从数据库读取所有装备类型数据");
                    const deferred = Q.defer();
                    _db.item_types.find({}, (err, docs) => {
                        if (err) return deferred.reject(err);
                        console.log("丨 > 从数据库读取所有装备类型数据 - 完成");
                        deferred.resolve(docs);
                    });
                    return deferred.promise;
                })

                .then((types) => {
                    const deferred = Q.defer();
                    let chain = Q(() => true);
                    console.log("丨 > 检查匹配");
                    // console.log(types, api_mst_equip_exslot)
                    types.forEach((type) => {
                        const modify = {};
                        const matched = api_mst_equip_exslot.includes(
                            type.id_ingame
                        );
                        if (matched) {
                            modify["$set"] = {
                                equipable_exslot: true,
                            };
                        } else {
                            modify["$unset"] = {
                                equipable_exslot: true,
                            };
                        }
                        chain = chain.then(() => {
                            const deferred = Q.defer();
                            _db.item_types.update(
                                {
                                    _id: type._id,
                                },
                                modify,
                                function (err) {
                                    if (err) return deferred.reject(err);
                                    if (matched)
                                        console.log(
                                            `丨   > 匹配: [${type.id}] (${type.id_ingame}) ${type.name.ja_jp}`
                                        );
                                    deferred.resolve();
                                }
                            );
                            return deferred.promise;
                        });
                    });

                    chain = chain
                        .then(() => deferred.resolve())
                        .catch((err) => deferred.reject(err));

                    return deferred.promise;
                })
                .then(() => console.log("丨 处理装备类型 - 完成"))

                // 获取全部装备数据
                .then(() => {
                    console.log("丨");
                    console.log("丨 处理装备");
                    console.log("丨 > 从数据库读取所有装备数据");
                    const deferred = Q.defer();
                    _db.items.find({}, (err, docs) => {
                        if (err) return deferred.reject(err);
                        console.log("丨 > 从数据库读取所有装备数据 - 完成");
                        deferred.resolve(docs);
                    });
                    return deferred.promise;
                })

                // 更新数据 - 所有装备
                .then((items) => {
                    // _log(map)

                    // var count = 0
                    //     , list = api_data.api_mst_slotitem
                    //     , max = list.length

                    const deferred = Q.defer();
                    const mapIdIndex = {};
                    let chain = Q(() => true);

                    console.log("丨 > 从游戏API获取装备ID与Index的对应");
                    api_mst_slotitem.forEach((item, index) => {
                        mapIdIndex[item.api_id] = index;
                    });
                    // console.log(mapIdIndex)
                    console.log("丨 > 从游戏API获取装备ID与Index的对应 - 完成");
                    console.log("丨 > 从游戏API获取补强增设栏位的额外配置");

                    items.forEach((item) => {
                        chain = chain.then(() => {
                            const deferred = Q.defer();
                            const index = mapIdIndex[item.id];
                            // console.log(item)
                            let promises = new Promise((resolve) => resolve);

                            if (typeof index === "undefined") {
                                setTimeout(() => {
                                    deferred.resolve();
                                });
                            }

                            const set = {};
                            const unset = {};
                            const data = api_mst_slotitem[index];
                            const getApiData = (key, apiName) => {
                                if (
                                    typeof data["api_" + apiName] ===
                                    "undefined"
                                ) {
                                    unset[key] = true;
                                    return undefined;
                                }
                                set[key] = data["api_" + apiName];
                                return data["api_" + apiName];
                            };

                            // base
                            getApiData("name.ja_jp", "name");
                            getApiData("rarity", "rare");
                            // stat
                            getApiData("stat.fire", "houg");
                            getApiData("stat.torpedo", "raig");
                            getApiData("stat.bomb", "baku");
                            getApiData("stat.asw", "tais");
                            getApiData("stat.aa", "tyku");
                            getApiData("stat.armor", "souk");
                            getApiData("stat.evasion", "houk");
                            getApiData("stat.hit", "houm");
                            getApiData("stat.los", "saku");
                            getApiData("stat.range", "leng");
                            getApiData("stat.distance", "distance");
                            getApiData("stat.cost", "cost");
                            // type ingame
                            getApiData("type_ingame", "type");
                            // misc
                            getApiData("dismantle", "broken");
                            set["time_modified"] = _g.timeNow();
                            // ex-slot extra ships
                            for (const [slotId, obj] of Object.entries(
                                api_mst_equip_exslot_ship
                            )) {
                                if (`${slotId}` !== `${item.id}`) continue;

                                const shipIds = Object.entries(
                                    obj.api_ship_ids || {}
                                )
                                    .filter(([, value]) => !!value)
                                    .map(([id]) => id);
                                const shipClasses = Object.entries(
                                    obj.api_ctypes || {}
                                )
                                    .filter(([, value]) => !!value)
                                    .map(([id]) => cTypesMap[id])
                                    .flat()
                                    .filter((v) => !!v);
                                const shipTypes = Object.entries(
                                    obj.api_stypes || {}
                                )
                                    .filter(([, value]) => !!value)
                                    .map(([id]) => sTypesMap[id])
                                    .flat()
                                    .filter((v) => !!v);

                                // console.log(obj.api_stypes, shipTypes);
                                console.log(
                                    `丨   > [${item.id}] ${item.name.ja_jp}`
                                );
                                console.log(
                                    `丨      > 额外舰种: `,
                                    shipTypes
                                        .map(
                                            (shipTypeId) =>
                                                `[${_g.data.ship_types[shipTypeId].id}] ${_g.data.ship_types[shipTypeId].name.zh_cn}`
                                        )
                                        .join(", ")
                                );
                                console.log(
                                    `丨      > 额外舰级: `,
                                    shipClasses
                                        .map(
                                            (shipClassId) =>
                                                `[${_g.data.ship_classes[shipClassId].id}] ${_g.data.ship_classes[shipClassId].name.zh_cn}`
                                        )
                                        .join(", ")
                                );
                                console.log(
                                    `丨      > 额外舰娘: `,
                                    shipIds
                                        .map(
                                            (shipId) =>
                                                `[${_g.data.ships[shipId].id}] ${_g.data.ships[shipId]._name}`
                                        )
                                        .join(", ")
                                );

                                // const sTypesMap = {};
                                // const cTypesMap = {};
                                set.exslot_on_ship = shipIds;
                                set.exslot_on_shiptype = shipTypes;
                                set.exslot_on_shipclass = shipClasses;

                                for (const [dbname, list] of [
                                    ["ships", shipIds],
                                    ["ship_classes", shipClasses],
                                    ["ship_types", shipTypes],
                                ]) {
                                    for (const id of list) {
                                        const item = _g.data[dbname][id];
                                        if (
                                            !Array.isArray(
                                                item.additional_exslot_item_ids
                                            )
                                        )
                                            item.additional_exslot_item_ids =
                                                [];
                                        item.additional_exslot_item_ids.push(
                                            Number(item.id)
                                        );

                                        const modify = {
                                            $set: {},
                                            $unset: {},
                                        };

                                        if (
                                            Array.isArray(
                                                item.additional_exslot_item_ids
                                            ) &&
                                            item.additional_exslot_item_ids
                                                .length
                                        ) {
                                            modify["$set"][
                                                "additional_exslot_item_ids"
                                            ] = [
                                                ...item.additional_exslot_item_ids,
                                            ];
                                        } else {
                                            modify["$unset"][
                                                "additional_exslot_item_ids"
                                            ] = true;
                                        }
                                        promises = promises.then(
                                            () =>
                                                new Promise((resolve) => {
                                                    _db[dbname].update(
                                                        {
                                                            id,
                                                        },
                                                        modify,
                                                        function () {
                                                            resolve();
                                                        }
                                                    );
                                                })
                                        );
                                    }
                                }
                            }
                            // api_mst_equip_exslot_ship.filter(obj => (
                            //     obj.api_slotitem_id === item.id
                            // )).forEach(obj => {
                            //     console.log(`丨   > [${item.id}] ${item.name.ja_jp} - 补强增设栏位额外舰娘: `, obj.api_ship_ids)
                            //     set.exslot_on_ship = obj.api_ship_ids
                            // })
                            [
                                "exslot_on_ship",
                                "exslot_on_shiptype",
                                "exslot_on_shipclass",
                            ].forEach((key) => {
                                if (
                                    !Array.isArray(set[key]) ||
                                    !set[key].length
                                ) {
                                    unset[key] = true;
                                }
                            });

                            [
                                // 清除历史遗留数据
                                "equipable_exslot_on_ship",
                            ].forEach((key) => {
                                unset[key] = true;
                            });

                            // _log(set)
                            promises = promises.then(() => {
                                _db.items.update(
                                    {
                                        _id: item._id,
                                    },
                                    {
                                        $set: set,
                                        $unset: unset,
                                    },
                                    (err) => {
                                        if (err) return deferred.reject(err);
                                        // console.log(`丨   > 修改后: `, set)
                                        deferred.resolve();
                                    }
                                );
                            });
                            return deferred.promise;
                        });
                    });

                    chain = chain
                        .then(() => {
                            console.log(
                                "丨 > 从游戏API获取补强增设栏位的额外配置 - 完成"
                            );
                            deferred.resolve();
                        })
                        .catch((err) => deferred.reject(err));

                    return deferred.promise;
                })
                .then(() => console.log("丨 处理装备 - 完成"))

                // 错误处理
                .catch(function (err) {
                    _log(err);
                })
                .done(function () {
                    console.log("丨");
                    _log("更新装备数据库 - 完成");
                });
        })
        .appendTo(section);

    for (var i in data) {
        /*
            基本信息
                id 			装备ID
                sortno 		图鉴ID
                name 		装备名
                info 		装备描述
                rare 		稀有度
            属性
                houg		火力
                raig		雷装
                tyku		对空
                tais		对潜
                taik		耐久
                saku 		索敌
                souk		装甲
                soku 		航速
                luck		运
                leng		射程
                            1 	短
                            2 	中
                            3	长
                            4 	超长
                houk		回避
                houm		命中
                baku		爆装
            解体
                broken 		ARRAY 解体资源
            未知
                atap
                bakk
                raik
                raim
                sakb
                type
                usebull
        */
        (function (d) {
            var dom = $("<section/>").appendTo(section),
                checkbox = $(
                    '<input type="checkbox" id="rawdata_slotitem_' +
                        d["api_id"] +
                        '"/>'
                ).appendTo(dom),
                title = $('<label for="rawdata_slotitem_' + d["api_id"] + '"/>')
                    .html("[#" + d["api_id"] + "] " + d["api_name"])
                    .appendTo(dom);

            _db.items.find({ id: d["api_id"] }, function (err, docs) {
                if (err || !docs.length) {
                    // 数据库中不存在
                    dom.addClass("new");
                    $("<button/>")
                        .on("click", function () {
                            _frame.app_main.page["items"].show_item_form({
                                id: d["api_id"],
                                rarity: d["api_rare"],
                                name: {
                                    ja_jp: d["api_name"],
                                },
                                stat: {
                                    fire: d["api_houg"],
                                    torpedo: d["api_raig"],
                                    bomb: d["api_baku"],
                                    asw: d["api_tais"],
                                    aa: d["api_tyku"],
                                    armor: d["api_souk"],
                                    evasion: d["api_houk"],
                                    hit: d["api_houm"],
                                    los: d["api_saku"],
                                    range: d["api_leng"],
                                    distance: d["api_distance"],
                                },
                                dismantle: d["api_broken"],
                            });
                        })
                        .html("录入")
                        .appendTo(dom);
                    // http://203.104.209.23/kcs/resources/image/slotitem/card/139.png
                } else if (!err) {
                    // 对比数据
                    //console.log(docs[0], d)
                }
            });
        })(data[i]);
    }
};

_frame.app_main.page["gamedata"].init_useitem = function (data) {
    var section = $(
        '<section class="list" data-tabname="Consumables"/>'
    ).appendTo(this.tabview);

    let names = {};

    // 按钮 & 功能: 更新本地道具数据库
    $('<button type="button"/>')
        .html("更新道具数据库")
        .on("click", function () {
            if (!_db.consumables) {
                _db.consumables = new node.nedb({
                    filename: node.path.join(_g.path.db, "/consumables.nedb"),
                    autoload: true,
                });
            }
            let db = _db.consumables,
                promise = Q.fcall(() => {
                    let deferred = Q.defer();
                    db.remove({}, { multi: true }, function (err, numRemoved) {
                        deferred.resolve();
                    });
                    return deferred.promise;
                });

            promise
                .then(() => {
                    let deferred = Q.defer();
                    for (let i in data) {
                        let item = data[i],
                            id = item.api_id,
                            doc = {};
                        for (let key in item) {
                            let _key = key.replace(/^api_/g, "");
                            let value = item[key];
                            switch (_key) {
                                case "name":
                                    value = names[id]
                                        ? names[id]
                                        : {
                                              ja_jp: item[key],
                                              zh_cn: "",
                                          };
                                    break;
                            }
                            doc[_key] = value;
                        }
                        promise = promise.then(() => {
                            let deferred = Q.defer();
                            db.insert(doc, function (err, newDoc) {
                                deferred.resolve();
                            });
                            return deferred.promise;
                        });
                    }
                    promise = promise.done(() => {
                        deferred.resolve();
                    });
                    return deferred.promise;
                })

                // 错误处理
                .catch(function (err) {
                    _log(err);
                })
                .done(function () {
                    _log("ALL DONE");
                });
        })
        .appendTo(section);

    for (let i in data) {
        let item = data[i],
            id = item.api_id,
            input;

        if (item.api_name) {
            names[id] = _g.data.consumables[id]
                ? _g.data.consumables[id].name
                : {
                      ja_jp: item.api_name,
                      zh_cn: "",
                  };
            input = $(`<input type="text"/>`)
                .val(names[id].zh_cn)
                .on({
                    input: (e) => {
                        names[id].zh_cn = e.target.value;
                    },
                });
        }

        $("<hr/>").appendTo(section);
        $("<dl/>")
            .appendTo(section)
            .append($(`<dt>${item.api_name}</dt>`))
            .append(input)
            .append($(`<dd>${item.api_description.join("<br/>")}</dd>`));
    }
};
