
_frame.app_main.page['ships'] = {}
_frame.app_main.page['ships'].section = {}


_frame.app_main.page['ships'].gen_table = function (/*d*/) {
    var table = $('<table/>')
    return table
}

_frame.app_main.page['ships'].gen_input = function (type, name, id, value, options) {
    options = options || {}
    let input, option_empty
    switch (type) {
        case 'text':
        case 'number':
        case 'hidden':
            input = $('<input/>', {
                'type': type,
                'name': name,
                'id': id
            }).val(value)
            break;
        case 'select':
            input = $('<select/>', {
                'name': name,
                'id': id
            })
            option_empty = $('<option value=""/>').html('').appendTo(input)
            for (var i in value) {
                let o_el
                if (typeof value[i] == 'object') {
                    o_el = $('<option value="' + (typeof value[i].val == 'undefined' ? value[i]['value'] : value[i].val) + '"/>')
                        .html(value[i]['title'] || value[i]['name'])
                        .appendTo(input)
                } else {
                    o_el = $('<option value="' + value[i] + '"/>')
                        .html(value[i])
                        .appendTo(input)
                }
                if (typeof options['default'] != 'undefined' && o_el.val() == options['default']) {
                    o_el.prop('selected', true)
                }
                if (!o_el.val()) {
                    o_el.attr('disabled', true)
                }
            }
            if (!value || !value.length) {
                option_empty.remove()
                $('<option value=""/>').html('...').appendTo(input)
            }
            if (options['new']) {
                $('<option value="" disabled/>').html('==========').insertAfter(option_empty)
                $('<option value="___new___"/>').html('+ 新建').insertAfter(option_empty)
                input.on('change.___new___', function () {
                    var select = $(this)
                    if (select.val() == '___new___') {
                        select.val('')
                        options['new'](input)
                    }
                })
            }
            break;
        case 'select_group':
            input = $('<select />', {
                'name': name,
                'id': id
            })
            option_empty = $('<option value=""/>').html('').appendTo(input)
            for (let i in value) {
                var group = $('<optgroup label="' + value[i][0] + '"/>').appendTo(input)
                for (var j in value[i][1]) {
                    var _v = value[i][1][j]
                    let o_el
                    if (typeof _v == 'object') {
                        o_el = $('<option value="' + (typeof _v.val == 'undefined' ? _v['value'] : _v.val) + '"/>')
                            .html(_v['title'] || _v['name'])
                            .appendTo(group)
                    } else {
                        o_el = $('<option value="' + _v + '"/>')
                            .html(_v)
                            .appendTo(group)
                    }
                    if (typeof options['default'] != 'undefined' && o_el.val() == options['default']) {
                        o_el.prop('selected', true)
                    }
                    if (!o_el.val()) {
                        o_el.attr('disabled', true)
                    }
                }
            }
            if (!value || !value.length) {
                option_empty.remove()
                $('<option value=""/>').html('...').appendTo(input)
            }
            if (options['new']) {
                $('<option value="" disabled/>').html('==========').insertAfter(option_empty)
                $('<option value="___new___"/>').html('+ 新建').insertAfter(option_empty)
                input.on('change.___new___', function () {
                    var select = $(this)
                    if (select.val() == '___new___') {
                        select.val('')
                        options['new'](input)
                    }
                })
            }
            break;
        case 'checkbox':
            input = $('<input/>', {
                'type': type,
                'name': name,
                'id': id
            }).prop('checked', value)
            break;
    }

    if (options.required) {
        input.prop('required', true)
    }

    if (options.onchange) {
        input.on('change.___onchange___', function () {
            options.onchange($(this))
        })
        if (options['default'])
            input.trigger('change')
    }

    if (!name)
        input.attr('name', null)

    return input
}
_frame.app_main.page['ships'].gen_form_line = function (type, name, label, value, suffix, options) {
    var line = $('<p/>')
        , id = '_input_g' + _g.inputIndex

    $('<label for="' + id + '"/>').html(label).appendTo(line)
    _frame.app_main.page['ships'].gen_input(type, name, id, value, options).appendTo(line)
    if (suffix)
        $('<label for="' + id + '"/>').html(suffix).appendTo(line)

    _g.inputIndex++
    return line
}







_frame.app_main.page['ships'].show_ship_form = function (d) {
    d.remodel = d.remodel || {}
    d.rels = d.rels || {}
    d.slot = d.slot || []
    d.equip = d.equip || []
    d.remodel_next = d.remodel.next || null

    let d_series = {}

    console.log(d)

    const _input = function (name, label, suffix, options) {
        return _frame.app_main.page['ships'].gen_form_line(
            'text', name, label, eval('d.' + name) || '', suffix, options
        )
    }

    const _stat = function (stat, label) {
        const line = $('<p/>')
        let id = '_input_g' + _g.inputIndex
        let input
        _g.inputIndex++

        switch (stat) {
            case 'consum': {
                $('<label for="' + id + '"/>').html('燃料').appendTo(line)
                input = _frame.app_main.page['ships'].gen_input(
                    'number',
                    'consum.fuel',
                    id,
                    d.consum.fuel
                ).appendTo(line)

                id = '_input_g' + _g.inputIndex
                _g.inputIndex++
                $('<label for="' + id + '"/>').html('弹药').appendTo(line)
                _frame.app_main.page['ships'].gen_input(
                    'number',
                    'consum.ammo',
                    id,
                    d.consum.ammo
                ).appendTo(line)
                break;
            }
            case 'speed': {
                const value = d.stat[stat]

                $('<label for="' + id + '"/>').html(label).appendTo(line)
                input = _frame.app_main.page['ships'].gen_input(
                    'select',
                    'stat.' + stat,
                    id,
                    [
                        {
                            'value': '5',
                            'title': '低速'
                        },
                        {
                            'value': '10',
                            'title': '高速'
                        }
                    ],
                    {
                        'default': value
                    }
                ).appendTo(line)
                $('<label for="' + id + '"/>').html('当前值: ' + value).appendTo(line)
                break;
            }
            case 'range': {
                var value = d.stat[stat]

                $('<label for="' + id + '"/>').html(label).appendTo(line)
                input = _frame.app_main.page['ships'].gen_input(
                    'select',
                    'stat.' + stat,
                    id,
                    [
                        {
                            'value': '1',
                            'title': '短'
                        },
                        {
                            'value': '2',
                            'title': '中'
                        },
                        {
                            'value': '3',
                            'title': '长'
                        },
                        {
                            'value': '4',
                            'title': '超长'
                        }
                    ],
                    {
                        'default': value
                    }
                ).appendTo(line)
                $('<label for="' + id + '"/>').html('当前值: ' + value).appendTo(line)
                break;
            }
            default: {
                const value = d.stat[stat]

                $('<label for="' + id + '"/>').html(label).appendTo(line)
                input = _frame.app_main.page['ships'].gen_input(
                    'number',
                    'stat.' + stat,
                    id,
                    value
                ).appendTo(line)

                if (stat == 'carry')
                    input.prop('readonly', true)

                if (stat == 'carry') {
                    $('<label for="' + id + '"/>').html('在“装备”页修改').appendTo(line)
                } else {
                    id = '_input_g' + _g.inputIndex
                    _g.inputIndex++
                    $('<label for="' + id + '"/>').html('最大').appendTo(line)
                    _frame.app_main.page['ships'].gen_input(
                        'number',
                        'stat.' + stat + '_max',
                        id,
                        d.stat[stat + '_max']
                    ).appendTo(line)
                }
                /*
                if( typeof d.stat[stat+'_max'] != 'undefined' ){
                    id = '_input_g' + _g.inputIndex
                    _g.inputIndex++
                    $('<label for="'+id+'"/>').html( '最大' ).appendTo(line)
                    _frame.app_main.page['ships'].gen_input(
                            'number',
                            'stat.'+stat+'_max',
                            id,
                            d.stat[stat+'_max']
                        ).appendTo(line)
                }else if( typeof d.stat[stat+'_married'] != 'undefined' ){
                    id = '_input_g' + _g.inputIndex
                    _g.inputIndex++
                    $('<label for="'+id+'"/>').html( '婚后' ).appendTo(line)
                    _frame.app_main.page['ships'].gen_input(
                            'text',
                            'stat.'+stat+'_married',
                            id,
                            d.stat[stat+'_married']
                        ).appendTo(line)
                }else if( stat == 'carry' ){
                    $('<label for="'+id+'"/>').html( '在“装备”页修改' ).appendTo(line)
                }
                */
                break;
            }
        }

        return line
    }

    const _slot = function (no, carry, equip) {
        const equipmentId = equip && typeof equip === 'object' ? equip.id : equip
        const equipmentStar = equip && typeof equip === 'object' ? equip.star : undefined

        const line = $('<p/>')
        let id = '_input_g' + _g.inputIndex

        _g.inputIndex++

        $('<label for="' + id + '"/>').html('#<span>' + no + '</span> 搭载').appendTo(line)
        _frame.app_main.page['ships'].gen_input(
            'number',
            'slot',
            id,
            carry
        ).on({
            // 'change, input': function () {
            //     let total = 0
            //     details_slot.find('input[name="slot"]').each(function () {
            //         total += parseInt($(this).val())
            //     })
            // }
        }).appendTo(line)

        id = '_input_g' + _g.inputIndex
        _g.inputIndex++
        $('<label for="' + id + '"/>').html('初始装备').appendTo(line)
        _comp.selector_equipment(
            'equip',
            '',
            equipmentId
        ).appendTo(line)

        id = '_input_g' + _g.inputIndex
        _g.inputIndex++
        $('<label for="' + id + '"/>').html('★').appendTo(line)
        _frame.app_main.page['ships'].gen_input(
            'number',
            'slot-equipment-star',
            id,
            equipmentStar
        ).appendTo(line)
        /*
        _frame.app_main.page['ships'].gen_input(
                'number',
                'equip',
                id,
                equip,
                {
                    'notRequired': true
                }
            ).appendTo(line)*/

        // 删除本行搭载信息
        $('<button type="button" class="delete"/>').html('&times;').on('click', function () {
            line.remove()
            details_slot.find('input[name="slot"]').each(function (index) {
                $(this).parent().find('label span').eq(0).html((index + 1))
            })
        }).appendTo(line)

        return line
    }

    const _link = function (no, name, url) {
        var line = $('<p/>')
            , id = '_input_g' + _g.inputIndex
        _g.inputIndex++

        $('<label for="' + id + '"/>').appendTo(line)
        //$('<label for="'+id+'"/>').html( '#<span>' + no + '</span>' ).appendTo(line)
        _frame.app_main.page['ships'].gen_input(
            'text',
            'link_name',
            id,
            name,
            { 'notRequired': true }
        ).appendTo(line)

        id = '_input_g' + _g.inputIndex
        _g.inputIndex++
        $('<label for="' + id + '"/>').html('URL').appendTo(line)
        _frame.app_main.page['ships'].gen_input(
            'text',
            'link_url',
            id,
            url,
            { 'notRequired': true }
        ).appendTo(line)

        // 删除本行搭载信息
        /*
        $('<button type="button" class="delete"/>').html('&times;').on('click', function(){
            line.remove()
            details_misc.find('input[name="link_name"]').each(function(index){
                $(this).parent().find('label span').eq(0).html( (index+1) )
            })
        }).appendTo(line)
        */

        return line
    }

    const _series = function (stat, extra_illust_no) {
        let line = $('<p/>')
        let id = '_input_g' + _g.inputIndex
        // let input
        _g.inputIndex++

        switch (stat) {
            case 'remodel': {
                $('<label for="' + id + '" class="remodel"/>').html('改造前ID').appendTo(line)
                _frame.app_main.page['ships'].gen_input(
                    'number',
                    'series.remodel_prev',
                    id,
                    d_series.remodel_prev || null,
                    { 'notRequired': true }
                ).appendTo(line)

                id = '_input_g' + _g.inputIndex
                _g.inputIndex++
                $('<label for="' + id + '"/>').html('等级').appendTo(line)
                _frame.app_main.page['ships'].gen_input(
                    'number',
                    'series.remodel_prev_lvl',
                    id,
                    d_series.remodel_prev_lvl || null,
                    { 'notRequired': true }
                ).appendTo(line)

                id = '_input_g' + _g.inputIndex
                _g.inputIndex++
                _frame.app_main.page['ships'].gen_input(
                    'checkbox',
                    'series.remodel_prev_blueprint',
                    id,
                    d_series.remodel_prev_blueprint || false,
                    { 'notRequired': true }
                ).appendTo(line)
                $('<label for="' + id + '"/>').html('蓝图').appendTo(line)

                id = '_input_g' + _g.inputIndex
                _g.inputIndex++
                _frame.app_main.page['ships'].gen_input(
                    'checkbox',
                    'series.remodel_prev_catapult',
                    id,
                    d_series.remodel_prev_catapult || false,
                    { 'notRequired': true }
                ).appendTo(line)
                $('<label for="' + id + '"/>').html('甲板').appendTo(line)

                id = '_input_g' + _g.inputIndex
                _g.inputIndex++
                _frame.app_main.page['ships'].gen_input(
                    'checkbox',
                    'series.remodel_prev_loop',
                    id,
                    d_series.remodel_prev_loop || false,
                    { 'notRequired': true }
                ).appendTo(line)
                $('<label for="' + id + '"/>').html('循环').appendTo(line)

                var line2 = $('<p/>')

                id = '_input_g' + _g.inputIndex
                _g.inputIndex++
                $('<label for="' + id + '" class="remodel"/>').html('改造后ID').appendTo(line2)
                _frame.app_main.page['ships'].gen_input(
                    'number',
                    'series.remodel_next',
                    id,
                    d_series.remodel_next || null,
                    { 'notRequired': true }
                ).appendTo(line2)

                id = '_input_g' + _g.inputIndex
                _g.inputIndex++
                $('<label for="' + id + '"/>').html('等级').appendTo(line2)
                _frame.app_main.page['ships'].gen_input(
                    'number',
                    'series.remodel_next_lvl',
                    id,
                    d_series.remodel_next_lvl || null,
                    { 'notRequired': true }
                ).appendTo(line2)

                id = '_input_g' + _g.inputIndex
                _g.inputIndex++
                _frame.app_main.page['ships'].gen_input(
                    'checkbox',
                    'series.remodel_next_blueprint',
                    id,
                    d_series.remodel_next_blueprint || false,
                    { 'notRequired': true }
                ).appendTo(line2)
                $('<label for="' + id + '"/>').html('蓝图').appendTo(line2)

                id = '_input_g' + _g.inputIndex
                _g.inputIndex++
                _frame.app_main.page['ships'].gen_input(
                    'checkbox',
                    'series.remodel_next_catapult',
                    id,
                    d_series.remodel_next_catapult || false,
                    { 'notRequired': true }
                ).appendTo(line2)
                $('<label for="' + id + '"/>').html('甲板').appendTo(line2)

                id = '_input_g' + _g.inputIndex
                _g.inputIndex++
                _frame.app_main.page['ships'].gen_input(
                    'checkbox',
                    'series.remodel_next_loop',
                    id,
                    d_series.remodel_next_loop || false,
                    { 'notRequired': true }
                ).appendTo(line2)
                $('<label for="' + id + '"/>').html('循环').appendTo(line2)

                // 基础等级
                id = '_input_g' + _g.inputIndex
                _g.inputIndex++
                _frame.app_main.page['ships'].gen_input(
                    'hidden',
                    'base_lvl',
                    id,
                    d_series.remodel_prev_lvl || 1,
                    { 'notRequired': true }
                ).appendTo(line2)

                line = line.add(line2)
                break;
            }
            case 'illust_delete': {
                _frame.app_main.page['ships'].gen_input(
                    'checkbox',
                    'series.illust_delete',
                    id,
                    d_series.illust_delete || false,
                    { 'notRequired': true }
                ).addClass('delete_illust').appendTo(line)
                $('<label for="' + id + '"/>').html('删除该舰娘图鉴大图').appendTo(line)
                break;
            }
            case 'illust_extra': {
                const no = extra_illust_no ? (parseInt(extra_illust_no) + 1) : 1
                $('<label for="' + id + '" class="extra_illust"/>').html('额外图鉴#' + no + ' extra_').appendTo(line)
                _frame.app_main.page['ships'].gen_input(
                    'number',
                    'series.illust_extra',
                    id,
                    d_series.illust_extra[extra_illust_no ? extra_illust_no : 0] || null,
                    { 'notRequired': true }
                ).appendTo(line)
                break;
            }
        }

        return line
    }

    var form = $('<form class="shipinfo new"/>')

        , base = $('<div class="base"/>').appendTo(form)
        , details = $('<div class="tabview"/>').appendTo(form)

        // 如果有 _id 则表明已存在数据，当前为编辑操作，否则为新建操作
        , _id = d._id ? $('<input type="hidden"/>').val(d._id) : null

        , details_stat = $('<section data-tabname="属性"/>').appendTo(details)
        , details_slot = $('<section data-tabname="装备"/>').appendTo(details)
        , details_misc = $('<section data-tabname="其他"/>').appendTo(details)
        , details_series = $('<section data-tabname="系列"/>').appendTo(details)
        , details_extra = $('<section data-tabname="额外"/>').appendTo(details);

    let base_class_select,
        d_series_true,
        d_series_true_index;

    // 标准图鉴
    $('<div class="image"/>').css('background-image', 'url(../pics/ships/' + d['id'] + '/2.png)').appendTo(base);

    // 基础信息
    (() => {
        _input('id', 'ID', null, { 'required': true }).appendTo(base)
        _input('no', '图鉴ID', null, { 'required': true }).appendTo(base)
        var h4 = $('<h4/>').html('舰娘名').appendTo(base)
        var checkbox_id = '_input_g' + _g.inputIndex
        _g.inputIndex++
        var _checkbox = _frame.app_main.page['ships'].gen_input(
            'checkbox',
            null,
            checkbox_id,
            false,
            {
                'onchange': function (checkbox) {
                    if (checkbox.prop('checked')) {
                        base.find('input[name^="name."]').not('input[name="name.suffix"]').prop('required', false)
                        base.find('select[name="name.suffix"]').prop('required', true)
                    } else {
                        base.find('input[name^="name."]').not('input[name="name.suffix"]').prop('required', true)
                        base.find('select[name="name.suffix"]').prop('required', false)
                    }
                }
            }
        ).insertBefore(h4)
        $('<label for="' + checkbox_id + '" class="name_suffix"/>').html('仅后缀').insertBefore(_checkbox)
        _input('name.ja_jp', '<small>日</small>').appendTo(base)
        _input('name.ja_kana', '<small>日假名</small>').appendTo(base)
        _input('name.ja_romaji', '<small>罗马音</small>').appendTo(base)
        _input('name.zh_cn', '<small>简中</small>').appendTo(base)
        _input('name.en_us', '<small>EN</small>').appendTo(base)
        var base_suffix = _frame.app_main.page['ships'].gen_form_line(
            'select',
            'name.suffix',
            '后缀名',
            [],
            null,
            {
                'notRequired': true
            }
        ).appendTo(base)
        _db.ship_namesuffix.find({}).sort({ 'id': 1 }).exec(function (err, docs) {
            if (!err) {
                var suffix = []
                    , sel = base_suffix.find('select')
                for (var i in docs) {
                    suffix.push({
                        //'value': 	docs[i]['_id'],
                        'value': docs[i]['id'],
                        'title': docs[i]['zh_cn']
                    })
                }
                // 实时载入舰种数据
                _frame.app_main.page['ships'].gen_input(
                    'select',
                    sel.attr('name'),
                    sel.attr('id'),
                    suffix,
                    {
                        'default': d['name']['suffix'],
                        'notRequired': true,
                        'new': function (select) {
                            console.log('NEW SHIP SUFFIX', select)
                        },
                    }).insertBefore(sel)
                sel.remove()
            }
        })
    })();

    // 属性
    (() => {
        _stat('fire', '火力').appendTo(details_stat)
        _stat('torpedo', '雷装').appendTo(details_stat)
        _stat('aa', '对空').appendTo(details_stat)
        _stat('asw', '对潜').appendTo(details_stat)

        _stat('hp', '耐久').appendTo(details_stat)
        _stat('armor', '装甲').appendTo(details_stat)
        _stat('evasion', '回避').appendTo(details_stat)
        _stat('carry', '搭载').appendTo(details_stat)

        _stat('speed', '速力').appendTo(details_stat)
        _stat('range', '射程').appendTo(details_stat)
        _stat('los', '索敌').appendTo(details_stat)
        _stat('luck', '　运').appendTo(details_stat)

        $('<h4/>').html('消耗').appendTo(details_stat)
        _stat('consum').appendTo(details_stat)
    })();

    // 装备
    (() => {
        for (var i = 0; i < Math.max(d['slot'].length, d['equip'].length); i++) {
            _slot(
                (i + 1),
                d['slot'][i] || 0,
                d['equip'][i] || null
            ).appendTo(details_slot)
        }
        var btn_add_slot = $('<button class="add" type="button"/>').on('click', function () {
            _slot(
                details_slot.find('input[name="slot"]').length + 1,
                0,
                null
            ).insertBefore(btn_add_slot)
        }).html('添加栏位').appendTo(details_slot)
    })();

    // 其他
    // 声优
    (() => {
        var _misc_cv = _frame.app_main.page['ships'].gen_form_line(
            'select',
            'rels.cv',
            '声优',
            []
        ).appendTo(details_misc)
        _db['entities'].find({}).sort({ 'id': 1 }).exec(function (err, docs) {
            if (!err) {
                var types = []
                    , sel = _misc_cv.find('select')
                for (var i in docs) {
                    types.push({
                        //'value': 	docs[i]['_id'],
                        'value': docs[i]['id'],
                        'title': docs[i]['name']['zh_cn']
                    })
                }
                // 实时载入舰种数据
                _frame.app_main.page['ships'].gen_input(
                    'select',
                    sel.attr('name'),
                    sel.attr('id'),
                    types,
                    {
                        'default': d['rels']['cv'],
                        'new': function (select) {
                            console.log('NEW ENTITY', select)
                        }
                    }).insertBefore(sel)
                sel.remove()
            }
        })
    })();

    // 画师
    (() => {
        var _misc_illustrator = _frame.app_main.page['ships'].gen_form_line(
            'select',
            'rels.illustrator',
            '画师',
            []
        ).appendTo(details_misc)
        _db['entities'].find({}).sort({ 'id': 1 }).exec(function (err, docs) {
            if (!err) {
                var types = []
                    , sel = _misc_illustrator.find('select')
                for (var i in docs) {
                    types.push({
                        //'value': 	docs[i]['_id'],
                        'value': docs[i]['id'],
                        'title': docs[i]['name']['zh_cn']
                    })
                }
                // 实时载入舰种数据
                _frame.app_main.page['ships'].gen_input(
                    'select',
                    sel.attr('name'),
                    sel.attr('id'),
                    types,
                    {
                        'default': d['rels']['illustrator'],
                        'new': function (select) {
                            console.log('NEW ENTITY', select)
                        }
                    }).insertBefore(sel)
                sel.remove()
            }
        })
    })();

    $('<h4/>').html('舰种&舰级').appendTo(details_misc);
    // 舰种
    (() => {
        var base_type = _frame.app_main.page['ships'].gen_form_line(
            'select',
            'type',
            '舰种',
            []
        ).appendTo(details_misc)
        _db.ship_types.find({}).sort({ 'code': 1, 'full': 1 }).exec(function (err, docs) {
            if (!err) {
                var types = []
                    , sel = base_type.find('select')
                for (var i in docs) {
                    types.push({
                        //'value': 	docs[i]['_id'],
                        'value': docs[i]['id'],
                        'title': '[' + docs[i]['code'] + '] ' + docs[i].name.zh_cn
                    })
                }
                // 实时载入舰种数据
                _frame.app_main.page['ships'].gen_input(
                    'select',
                    sel.attr('name'),
                    sel.attr('id'),
                    types,
                    {
                        'default': d['type'],
                        'new': function (select) {
                            console.log('NEW SHIP TYPE', select)
                        },
                        // 改变舰种后，实时读取舰级数据
                        'onchange': function (select) {
                            base_class_select.html('<option value=""/>...</option>')
                            _db.ship_classes.find({
                                'ship_type_id': parseInt(select.val())
                            }, function (err_classes, docs_classes) {
                                if (!err_classes) {
                                    var classes = []
                                        , _sel = base_class_select
                                    for (var j in docs_classes) {
                                        classes.push({
                                            //'value': 	docs_classes[j]['_id'],
                                            'value': docs_classes[j]['id'],
                                            'title': docs_classes[j].name.zh_cn + '级'
                                        })
                                    }
                                    if (!docs_classes || !docs_classes.length) {
                                        classes.push({
                                            'value': '',
                                            'title': ''
                                        })
                                    }
                                    base_class_select = _frame.app_main.page['ships'].gen_input(
                                        'select',
                                        _sel.attr('name'),
                                        _sel.attr('id'),
                                        classes,
                                        {
                                            'new': function (select) {
                                                console.log('NEW SHIP CLASS', select)
                                            }
                                        }).insertBefore(_sel)
                                    _sel.remove()

                                    if (d['type'] && base_type.find('select').val() == d['type']) {
                                        base_class_select.val(d['class'])
                                    }
                                }
                            })
                        }
                    }).insertBefore(sel)
                sel.remove()
            }
        })
    })();

    // 舰级
    (() => {
        var base_class = _frame.app_main.page['ships'].gen_form_line(
            'select',
            'class',
            '舰级',
            []
        ).appendTo(details_misc)
        base_class_select = base_class.find('select')
        _input('class_no', '编号', '号舰').appendTo(details_misc)
    })();

    // 军籍
    (() => {
        const lineNavy = $('<p/>').appendTo(details_misc)
            , idNavy = '_input_g' + _g.inputIndex
        _g.inputIndex++
        $('<label for="' + idNavy + '"/>').html('军籍').appendTo(lineNavy)
        _frame.app_main.page['ships'].gen_input(
            'select',
            'navy',
            idNavy,
            [
                {
                    'value': 'km',
                    'title': '纳粹德国海军 / 战争海军 (Kriegsmarine)'
                },
                {
                    'value': 'rm',
                    'title': '意大利皇家海军 (Regia Marina)'
                },
                {
                    'value': 'mn',
                    'title': '法国海军 (Marine nationale)'
                },
                {
                    'value': 'rn',
                    'title': '英国皇家海军 (Royal Navy)'
                },
                {
                    'value': 'usn',
                    'title': '美国海军 (United States Navy)'
                },
                {
                    'value': 'vmf',
                    'title': '苏联海军 (Военно-морской флот СССР)'
                },
                {
                    'value': 'sm',
                    'title': '瑞典海军 (Svenska marinen)'
                },
                {
                    'value': 'ran',
                    'title': '澳大利亚皇家海军 (Royal Australian Navy)'
                },
                {
                    'value': 'rnln',
                    'title': '荷兰皇家海军 (Royal Netherlands Navy)'
                }
            ],
            {
                'default': d.navy
            }
        ).appendTo(lineNavy)
    })();

    // 链接
    (() => {
        _form.section_order(
            '链接',
            function (data, index) {
                return _link(index + 1, data['name'] || null, data['url'] || null)
            },
            $.extend(true,
                [
                    {
                        'name': '日文WIKI',
                        'url': null
                    },
                    {
                        'name': '英文WIKI',
                        'url': null
                    }
                ],
                d['links']
            )
        ).appendTo(details_misc)
    })();
    /*
        $('<h4/>').html('链接').appendTo(details_misc)
        var link_defaults = [
            '日文WIKI',
            '英文WIKI'
        ]
            ,_links_exists = parseInt( d['links'] ? d['links'].length : 0 )
        for( var i in d['links'] ){
            _link((parseInt(i)+1), d['links'][i]['name'], d['links'][i]['url']).appendTo(details_misc)
            if( $.inArray(d['links'][i]['name'], link_defaults) > -1 )
                link_defaults.splice( $.inArray(d['links'][i]['name'], link_defaults), 1 )
        }
        for( var i in link_defaults ){
            _link((_links_exists + parseInt(i) +1), link_defaults[i], '').appendTo(details_misc)
        }
        var btn_add_link = $('<button class="add" type="button"/>').on('click', function(){
            _link(
                details_misc.find('input[name="link_name"]').length + 1,
                '',
                ''
            ).insertBefore(btn_add_link)
        }).html('添加链接').appendTo(details_misc)
    */

    // 系列
    (() => {
        d_series = {
            'illust_extra': []
        }
        // let d_series_true = null
        // let d_series_true_index = null
        _db.ship_series.find({ 'id': d['series'] }).exec(function (err, docs) {
            if (!err && docs && docs.length) {
                d_series_true = docs[0]
                for (var i in docs[0].ships) {
                    var index = parseInt(i)
                    if (d['id'] == docs[0].ships[index]['id']) {
                        d_series_true_index = index
                        if (index > 0) {
                            d_series.remodel_prev = docs[0].ships[index - 1]['id'] || null
                            d_series.remodel_prev_lvl = docs[0].ships[index - 1]['next_lvl'] || null
                            d_series.remodel_prev_blueprint = docs[0].ships[index - 1]['next_blueprint'] || false
                            d_series.remodel_prev_catapult = docs[0].ships[index - 1]['next_catapult'] || false
                            d_series.remodel_prev_loop = docs[0].ships[index - 1]['next_loop'] || false
                        }
                        if (docs[0].ships[index + 1]) {
                            d_series.remodel_next = docs[0].ships[index + 1]['id'] || null
                            d.remodel_next = d.remodel_next || (docs[0].ships[index + 1]['id'] || null)
                        }
                        d_series.remodel_next_lvl = docs[0].ships[index]['next_lvl'] || null
                        if (d.remodel.next) {
                            d_series.remodel_next = parseInt(d.remodel.next) || null
                        }
                        if (d.remodel.next_lvl) {
                            d_series.remodel_next_lvl = parseInt(d.remodel.next_lvl) || null
                        }
                        d_series.remodel_next_blueprint = docs[0].ships[index]['next_blueprint'] || false
                        d_series.remodel_next_catapult = docs[0].ships[index]['next_catapult'] || false
                        d_series.remodel_next_loop = docs[0].ships[index]['next_loop'] || false
                        d_series.illust_delete = docs[0].ships[index]['illust_delete'] || false
                        d_series.illust_extra = docs[0].ships[index]['illust_extra'] || []
                        break
                    }
                }
                if (!d_series.remodel_prev) {
                    d_series.remodel_prev = parseInt(d.remodel.prev) || null
                    d_series.remodel_prev_lvl = parseInt(d.remodel.prev_lvl) || null
                    d_series.remodel_prev_blueprint = d.remodel.prev_blueprint || false
                    d_series.remodel_prev_catapult = d.remodel.prev_catapult || false
                    d_series.remodel_prev_loop = d.remodel.prev_loop || false
                }
            } else {
                d_series.remodel_prev = parseInt(d.remodel.prev) || null
                d_series.remodel_prev_lvl = parseInt(d.remodel.prev_lvl) || null
                d_series.remodel_prev_blueprint = d.remodel.prev_blueprint || false
                d_series.remodel_prev_catapult = d.remodel.prev_catapult || false
                d_series.remodel_prev_loop = d.remodel.prev_loop || false
                d_series.remodel_next = parseInt(d.remodel.next) || null
                d_series.remodel_next_lvl = parseInt(d.remodel.next_lvl) || null
                d_series.remodel_next_blueprint = d.remodel.next_blueprint || false
                d_series.remodel_next_catapult = d.remodel.next_catapult || false
                d_series.remodel_next_loop = d.remodel.next_loop || false
                d.remodel_next = d.remodel_next || (parseInt(d.remodel.next) || null)
            }

            $('<h4/>').html('改造').appendTo(details_series)
            _series('remodel').appendTo(details_series)

            $('<h4/>').html('图鉴').appendTo(details_series)
            _series('illust_delete').appendTo(details_series)
            var _illust_extra = d_series.illust_extra || [1]
            if (!_illust_extra.length)
                _illust_extra = [1]
            for (let i in _illust_extra) {
                _series(
                    'illust_extra',
                    i
                ).appendTo(details_series)
            }
            var btn_add_extraillust = $('<button class="add" type="button"/>').on('click', function () {
                _series(
                    'illust_extra',
                    details_series.find('input[name="series.illust_extra"]').length
                ).insertBefore(btn_add_extraillust)
            }).html('添加额外图鉴').appendTo(details_series)

            d.remodel_next = d.remodel_next || d_series.remodel_next
            if (d.remodel_next)
                $('<input type="hidden" name="remodel_next"/>').val(d.remodel_next).appendTo(details_series)
        })
    })();

    // 额外
    { // 特殊能力
        $('<h4/>').html('额外属性').appendTo(details_extra)
        const {
            capabilities = {}
        } = d
        _g.shipCapabilities.forEach(obj => {
            let value = capabilities[obj.key]
            switch (obj.type) {
                case 'select': {
                    value = obj.values || []
                    break
                }
            }
            _frame.app_main.page['ships'].gen_form_line(
                obj.type || 'checkbox',
                `capabilities.${obj.key}`,
                obj.name,
                value
            ).appendTo($('<p/>').appendTo(details_extra))
        })
        // let line_additional_night_shelling = $('<p/>').appendTo(details_extra)
        //     , id_additional_night_shelling = '_input_g' + _g.inputIndex
        // _g.inputIndex++
        // _frame.app_main.page['ships'].gen_input(
        //     'checkbox',
        //     'additional_night_shelling',
        //     id_additional_night_shelling,
        //     d.additional_night_shelling || false
        // ).appendTo(line_additional_night_shelling)
        // $('<label for="' + id_additional_night_shelling + '"/>').html('[CV] 夜战炮击能力').appendTo(line_additional_night_shelling)
        // _input('tp', 'TP').appendTo($('<p/>').appendTo(details_extra))
    }

    // 修改舰级航速规则
    (() => {
        $('<h4/>').html('修改舰级航速规则').appendTo(details_extra)
        var lineOverideSpeedRule = $('<p/>').appendTo(details_extra)
            , idOverideSpeedRule = '_input_g' + _g.inputIndex
        _g.inputIndex++
        var valuesSpeedRule = [
            'low-1',
            'low-2',
            'low-3',
            'low-4',
            'high-1',
            'high-2',
            'high-3',
            'high-4'
        ]
        _frame.app_main.page['ships'].gen_input(
            'select',
            'speed_rule',
            idOverideSpeedRule,
            valuesSpeedRule,
            {
                'default': d.speed_rule
            }
        ).appendTo(lineOverideSpeedRule)
    })();

    // 装备类型
    (() => {
        $('<h4/>').html('额外装备类型').appendTo(details_extra)
        _form.create_item_types('additional_item_types', d['additional_item_types'] || []).appendTo(details_extra)
        $('<h4/>').html('不可装备类型').appendTo(details_extra)
        _form.create_item_types('additional_disable_item_types', d['additional_disable_item_types'] || []).appendTo(details_extra)
    })();

    // 额外装备
    {
        // additional_items
        const 额外装备 = $('<div class="additional_items" />').appendTo(details_extra)
        $('<h4/>').html('额外装备').appendTo(额外装备)

        const createNewLine = (id) => {
            id = id ? parseInt(id) : undefined

            const inputName = 'additional_items'
            const line = $('<div class="line" />').appendTo(额外装备)

            _comp.selector_equipment(
                inputName,
                '',
                id
            ).appendTo(line)

            $('<button type="button" class="delete"/>').html('&times;').on('click', function () {
                line.remove()
            }).appendTo(line)

            if (!id) {
                line.addClass('empty')
                setTimeout(() => {
                    line.on('change.new', evt => {
                        const id = evt.target.value
                        if (id) {
                            line.removeClass('empty').off('change.new')
                            createNewLine()
                        }
                    })
                })
            }

            return line
        }
        
        if (Array.isArray(d.additional_items)) {
            d.additional_items.forEach(createNewLine)
        }
        createNewLine()
    }

    // 提交等按钮
    var line = $('<p class="actions"/>').appendTo(form)
    $('<button type="submit"/>').html(d._id ? '编辑' : '入库').appendTo(line)


    // 提交函数
    form.on('submit', function (e) {
        console.log(``)
        console.log(`UPDATING SHIP [${d.id}] ${d._name}`)
        var function_queue = []

            , ship_next = null
            , ship_id_next = null
            , series_id = null

            , unset = {}

        function function_queue_run() {
            if (!function_queue.length)
                return true
            function_queue[0]()
            function_queue.shift()
            function_queue_run()
        }
        function _parse_db_series() {
            if (data['series']['remodel_next']) {
                ship_id_next = data['series']['remodel_next']
                ship_next = {
                    'prev': data['id'],
                    'prev_lvl': data['series']['remodel_next_lvl'],
                    'prev_blueprint': data['series']['remodel_next_blueprint'],
                    'prev_catapult': data['series']['remodel_next_catapult'],
                    'prev_loop': data['series']['remodel_next_loop']
                }
            }
            //d_series_true
            //d_series_true_index
            // 如果存在 d_series_true，表示已有 series，则更新操作
            // 如果不存在，优先检查 remodel_prev 和 remodel_next 是否有 series，如果有，则更新操作
            // 否则则为新建操作
            if (!d_series_true && (data['series']['remodel_prev'] || data['series']['remodel_next'])) {
                series_id = null
                const _do_check = function (check_id, is_last) {
                    _db.ships.find({ 'id': check_id }, function (err, docs) {
                        if (!err && docs && docs.length)
                            series_id = docs[0].series

                        if (!is_last && !series_id && data['series']['remodel_next']) {
                            console.log(series_id)
                            _do_check(data['series']['remodel_next'], true)
                        } else {
                            console.log(series_id)
                            _db.ship_series.find({ 'id': series_id }).exec(function (err, docs) {
                                if (!err && docs && docs.length) {
                                    d_series_true = docs[0]
                                    for (var i in docs[0].ships) {
                                        var index = parseInt(i)
                                        if (d['id'] == docs[0].ships[index]['id']) {
                                            d_series_true_index = index
                                            if (index > 0) {
                                                data['series'].remodel_prev = docs[0].ships[index - 1]['id'] || null
                                                data['series'].remodel_prev_lvl = docs[0].ships[index - 1]['next_lvl'] || null
                                                data['series'].remodel_prev_blueprint = docs[0].ships[index - 1]['next_blueprint'] || false
                                                data['series'].remodel_prev_catapult = docs[0].ships[index - 1]['next_catapult'] || false
                                                data['series'].remodel_prev_loop = docs[0].ships[index - 1]['next_loop'] || false
                                            }
                                            if (docs[0].ships[index + 1]) {
                                                data['series'].remodel_next = docs[0].ships[index + 1]['id'] || null
                                                data['remodel_next'] = docs[0].ships[index + 1]['id'] || null
                                            }
                                            data['series'].remodel_next_lvl = docs[0].ships[index]['next_lvl'] || null
                                            if (d.remodel.next) {
                                                data['series'].remodel_next = parseInt(d.remodel.next) || null
                                            }
                                            if (d.remodel.next_lvl) {
                                                data['series'].remodel_next_lvl = parseInt(d.remodel.next_lvl) || null
                                            }
                                            data['series'].remodel_next_blueprint = docs[0].ships[index]['next_blueprint'] || false
                                            data['series'].remodel_next_catapult = docs[0].ships[index]['next_catapult'] || false
                                            data['series'].remodel_next_loop = docs[0].ships[index]['next_loop'] || false
                                            data['series'].illust_delete = docs[0].ships[index]['illust_delete'] || false
                                            data['series'].illust_extra = docs[0].ships[index]['illust_extra'] || []
                                            break
                                        }
                                    }
                                }

                                _do_parse()
                            })
                        }
                    })
                }

                if (data['series']['remodel_prev']) {
                    _do_check(data['series']['remodel_prev'])
                } else if (data['series']['remodel_next']) {
                    _do_check(data['series']['remodel_next'], true)
                } else {
                    _do_parse()
                }

            } else {
                _do_parse()
            }

            function _do_parse() {
                if (d_series_true) {
                    if (!d_series_true_index && d_series_true_index !== 0)
                        d_series_true_index = d_series_true.ships.length
                    console.log('> SERIES ', d_series_true, d_series_true_index, data)
                    var _length = d_series_true.ships.length
                        , _prev = d_series_true_index > 0 ? d_series_true.ships[d_series_true_index - 1] : null
                        , _next = d_series_true_index < _length - 1 ? d_series_true.ships[d_series_true_index + 1] : null

                    if (_prev) {
                        _prev['id'] = data['series']['remodel_prev']
                        _prev['next_lvl'] = data['series']['remodel_prev_lvl']
                        _prev['next_blueprint'] = data['series']['remodel_prev_blueprint']
                        _prev['next_catapult'] = data['series']['remodel_prev_catapult']
                        _prev['next_loop'] = data['series']['remodel_prev_loop']
                    }

                    if (!d_series_true.ships[d_series_true_index])
                        d_series_true.ships[d_series_true_index] = {
                            'id': data['id']
                        }

                    d_series_true.ships[d_series_true_index]['next_lvl'] = data['series']['remodel_next_lvl']
                    d_series_true.ships[d_series_true_index]['next_blueprint'] = data['series']['remodel_next_blueprint']
                    d_series_true.ships[d_series_true_index]['next_catapult'] = data['series']['remodel_next_catapult']
                    d_series_true.ships[d_series_true_index]['next_loop'] = data['series']['remodel_next_loop']
                    d_series_true.ships[d_series_true_index]['illust_delete'] = data['series']['illust_delete']
                    d_series_true.ships[d_series_true_index]['illust_extra'] = data['series']['illust_extra']

                    if (_next) {
                        _next['id'] = data['series']['remodel_next']
                    } else if (data['series']['remodel_next']) {
                        d_series_true.ships.push({
                            'id': data['series']['remodel_next']
                        })
                    }

                    data['series'] = d_series_true['id']
                    series_id = d_series_true['id']
                    _db.ship_series.update({
                        '_id': d_series_true['_id']
                    }, { $set: d_series_true }, {}, function (/*err, numReplaced*/) {
                        console.log('> SERIES UPDATE', d_series_true)
                        start_db_operate()
                    });
                } else {
                    d_series_true = {
                        'ships': []
                    }
                    if (data['series'].remodel_prev) {
                        d_series_true.ships.push({
                            'id': data['series']['remodel_prev'],
                            'next_lvl': data['series']['remodel_prev_lvl'],
                            'next_blueprint': data['series']['remodel_prev_blueprint'],
                            'next_catapult': data['series']['remodel_prev_catapult'],
                            'next_loop': data['series']['remodel_prev_loop']
                        })
                    }
                    d_series_true.ships.push({
                        'id': data['id'],
                        'next_lvl': data['series']['remodel_next_lvl'],
                        'next_blueprint': data['series']['remodel_next_blueprint'],
                        'next_catapult': data['series']['remodel_next_catapult'],
                        'next_loop': data['series']['remodel_next_loop'],
                        'illust_delete': data['series']['illust_delete'],
                        'illust_extra': data['series']['illust_extra']
                    })

                    if (data['series'].remodel_next) {
                        d_series_true.ships.push({
                            'id': data['series']['remodel_next']
                        })
                    }
                    _db.ship_series.count({}, function (err, count) {
                        d_series_true['id'] = parseInt(count) + 1
                        _db.ship_series.insert(
                            d_series_true,
                            function (err, newDoc) {
                                console.log('> SERIES INSERT', newDoc)
                                data['series'] = newDoc['id']
                                series_id = newDoc['id']
                                start_db_operate()
                            }
                        );
                    })
                }
            }
        }
        function start_db_operate() {
            if (_id) {
                // 存在 _id，当前为更新操作
                data.time_modified = _g.timeNow()
                console.log('> EDIT - set', data)
                console.log('> EDIT - unset', unset)
                _db.ships.update({
                    '_id': d._id
                }, { $set: data, $unset: unset }, {}, function (err, numReplaced) {
                    console.log('> UPDATE COMPLETE', numReplaced, data)
                    data._id = d._id
                    // 在已入库表格中更改原有数据行
                    var oldTr = _frame.app_main.page['ships'].section['已入库'].dom.section
                        //_frame.app_main.page['ships'].section['已入库'].dom.table
                        .find('tr[data-shipId="' + data['id'] + '"]')
                    //_frame.app_main.page['ships'].section['已入库'].append_table_tr( data )
                    _frame.app_main.page['ships'].section['已入库'].dom.section.data('shiplist').append_ship(data)
                        .insertBefore(oldTr)
                    oldTr.remove()
                    _frame.modal.hide()
                })
            } else {
                // 不存在 _id，当前为新建操作
                data.time_created = _g.timeNow()
                // 删除JSON数据
                node.fs.unlink(_g.path.fetched.ships + '/' + data['id'] + '.json', function (err) {
                    _db.ships.insert(data, function (err, newDoc) {
                        console.log('> INSERT COMPLETE', newDoc)
                        // 删除“未入库”表格中对应的行
                        try {
                            _frame.app_main.page['ships'].section['未入库'].dom.table
                                .find('tr[data-shipId="' + data['id'] + '"]').remove()
                        } catch (e) { }
                        // 在“已入库”表格开头加入行
                        _frame.app_main.page['ships'].section['已入库'].dom.section.data('shiplist').append_ship(newDoc)
                        //_frame.app_main.page['ships'].section['已入库'].append_table_tr( newDoc )
                        _frame.modal.hide()

                        // 立即处理改造后舰娘
                        if (ship_id_next) {
                            try {
                                _frame.modal.resetContent()
                                _frame.app_main.page['ships'].section['未入库'].dom.table
                                    .find('tr[data-shipId="' + ship_id_next + '"]').trigger('click', [{
                                        'name': {
                                            'ja_romaji': newDoc['name']['ja_romaji'],
                                            'zh_cn': newDoc['name']['zh_cn']
                                        },
                                        'rels': {
                                            'cv': newDoc['rels']['cv'],
                                            'illustrator': newDoc['rels']['illustrator'],
                                        },
                                        'series': series_id,
                                        'type': newDoc['type'],
                                        'class': newDoc['class'],
                                        'class_no': newDoc['class_no']
                                    }])
                            } catch (e) {

                            }
                        }
                    })
                })
            }
        }

        e.preventDefault()
        var data = {}

        // 处理所有数据，将带有 . 的数据变为 object 元素
        data = $(this).serializeObject()
        data['class_no'] = parseInt(data['class_no']) || (data['class_no'] ? data['class_no'] : null)

        const delete_illust = data['series']['illust_delete'] || false
        if (!data['series']['illust_extra'].push)
            data['series']['illust_extra'] = [data['series']['illust_extra']]
        if (delete_illust) {
            data.illust_same_as_prev = true
            data.illust_extra = null
        } else {
            data.illust_same_as_prev = false
            if (data['series']['illust_extra'])
                data.illust_extra = data['series']['illust_extra']
        }
        if (!data.illust_same_as_prev) {
            delete data.illust_same_as_prev
            unset.illust_same_as_prev = true
        }
        if (!data.illust_extra || !data.illust_extra.length || data.illust_extra.every(item => (!item))) {
            delete data.illust_extra
            unset.illust_extra = true
        }

        if (typeof data['additional_item_types'] != 'object' && typeof data['additional_item_types'] != 'undefined')
            data['additional_item_types'] = [data['additional_item_types']]
        data['additional_item_types'] = data['additional_item_types'] || []
        if (!data['additional_item_types'].length) {
            delete data['additional_item_types']
            unset.additional_item_types = true
        }

        if (typeof data['additional_disable_item_types'] != 'object' && typeof data['additional_disable_item_types'] != 'undefined')
            data['additional_disable_item_types'] = [data['additional_disable_item_types']]
        data['additional_disable_item_types'] = data['additional_disable_item_types'] || []
        if (!data['additional_disable_item_types'].length) {
            delete data['additional_disable_item_types']
            unset.additional_disable_item_types = true
        }

        if (data['additional_night_shelling']) {
            data['additional_night_shelling'] = true
        } else {
            delete data['additional_night_shelling']
            unset.additional_night_shelling = true
        }

        if (!data['tp']) delete data['tp']
        if (!data['navy']) delete data['navy']

        { // 名称
            if (!data['name']['suffix'])
                data['name']['suffix'] = null
            // 存在后缀时，删除其他名称
            /*
                if( data['name']['suffix'] ){
                    for( var i in data['name'] ){
                        if( i != 'suffix' )
                            delete data['name'][i]
                    }
                }*/
        }

        { // 格数 & 装备 & 搭载总量
            if (!data['slot'])
                data['slot'] = []
            else if (!Array.isArray(data['slot']))
                data['slot'] = [data['slot']]

            if (!data['equip'])
                data['equip'] = []
            else if (!Array.isArray(data['equip']))
                data['equip'] = [data['equip']]

            const {
                // ['slot-equipment-star']: slotEquipmentStar,
                equip,
                slot
            } = data

            // console.log(slotEquipmentStar)
            const slotEquipmentStar = []
            form.find('[name="slot-equipment-star"]').each((index, el) => {
                // console.log(el, el.value)
                slotEquipmentStar.push(el.value)
            })
            // console.log(slotEquipmentStar)
            data.equip = slot.map((carry, index) => {
                const equipmentId = Array.isArray(equip) ? (
                    equip[index] && typeof equip[index] === 'object'
                        ? equip[index].id
                        : equip[index]
                ) : undefined
                if (equipmentId && Array.isArray(slotEquipmentStar) && slotEquipmentStar[index]) {
                    return {
                        id: isNaN(equipmentId) ? undefined : parseInt(equipmentId),
                        star: isNaN(slotEquipmentStar[index]) ? undefined : parseInt(slotEquipmentStar[index])
                    }
                }
                return equipmentId || undefined
            })
            delete data['slot-equipment-star']

            let carry_num = 0
            for (const i in data['slot']) {
                carry_num += parseInt(data['slot'][i])
            }
            data['stat']['carry'] = carry_num
        }

        { // 链接
            data['links'] = []
            details_misc.find('input[name="link_name"]').each(function (index) {
                var name = $(this)
                    , line = $(this).parent()
                    , url = line.find('input[name="link_url"]').val()
                name = name.val()

                data['links'].push({
                    'name': name,
                    'url': url
                })
            })
            data.link_name = null
            data.link_url = null
            delete data.link_name
            delete data.link_url
        }

        { // 额外能力
            let capabilities_count = 0
            for (let key in data.capabilities) {
                const value = data.capabilities[key]
                if (value === 'on')
                    data.capabilities[key] = true
                if (value !== undefined && value !== null && value !== '') {
                    capabilities_count++
                } else {
                    delete data.capabilities[key]
                    unset[`capabilities.${key}`] = true
                }
            }
            if (!capabilities_count) {
                delete data.capabilities
                unset.capabilities = true
            }
            if (Array.isArray(data.additional_items)) {
                data.additional_items = [...new Set(
                    data.additional_items
                        .filter(id => !!id)
                        .map(id => parseInt(id))
                )]

                if (!data.additional_items.length) 
                    delete data.additional_items
            } else {
                delete data.additional_items
            }
        }

        { // 航速规则
            if (_g.data.ship_classes[data.class]) {
                if (_g.data.ship_classes[data.class].speed_rule === data.speed_rule)
                    delete data.speed_rule
            }
            if (!data.speed_rule) {
                delete data.speed_rule
                unset.speed_rule = true
            }
        }

        // 系列
        //if( data.series.illust_delete ){
        //	function_queue.push(
        //		_delete_illust
        //	)
        //}
        //function_queue.push(
        //	_parse_db_series
        //)

        // 写入数据
        //function_queue.push(
        //	start_db_operate
        //)

        //function_queue_run()

        // 删除多余图鉴
        new Promise(resolve => {
            if (delete_illust) {
                var files = [
                    '8.png',
                    '9.png',
                    '10.png'
                ]
                const _delete = function () {
                    node.fs.unlink(_g.path.pics.ships + '/' + data['id'] + '/' + files[0], function (err) {
                        if (files.length) {
                            files.shift()
                            _delete()
                        } else {
                            resolve()
                        }
                    })
                }
                _delete()
            } else {
                resolve()
            }
        })
            // 更新关系数据
            .then(() => new Promise(resolve => {
                const rels_to_parse = [
                    'cv',
                    'illustrator'
                ]
                const parse_rels = () => {
                    if (rels_to_parse.length) {
                        _db['entities'].find({ 'id': data['rels'][rels_to_parse[0]] || -1 }, function (err, docs) {
                            if (!err && docs && docs.length) {
                                var entity_update_set_rels = docs[0]['rels'] || {}
                                if (typeof entity_update_set_rels[rels_to_parse[0]] == 'undefined')
                                    entity_update_set_rels[rels_to_parse[0]] = []

                                if ($.inArray(data['id'], entity_update_set_rels[rels_to_parse[0]]) < 0)
                                    entity_update_set_rels[rels_to_parse[0]].push(data['id'])

                                var entity_update_set = {
                                    'rels': entity_update_set_rels
                                }

                                _db['entities'].update({
                                    '_id': docs[0]._id
                                }, { $set: entity_update_set }, {}, function (err, numReplaced) {
                                    console.log('> ENTITY UPDATE COMPLETE', numReplaced, entity_update_set)
                                    rels_to_parse.shift()
                                    parse_rels()
                                })
                            } else {
                                rels_to_parse.shift()
                                parse_rels()
                            }
                        })
                    } else {
                        resolve()
                    }
                }
                parse_rels()
            }))

            .then(() => {
                _parse_db_series()
            })

        // console.log(data)
        // return

    })


    _frame.modal.show(
        form,
        d.name.ja_jp || '未入库舰娘',
        {
            'classname': 'infos_form'
        }
    )
}






_frame.app_main.page['ships'].gen_form_new_ship_type = function (callback) {
    callback = callback || function () { }
    var self = _frame.app_main.page['ships'].section['舰种&舰级']
        , form = $('<form class="new_ship_type"/>').on('submit', function (e) {
            e.preventDefault()
            var data = $(this).serializeObject()

            // 获取当前共有多少舰种，确定新建舰种的数字ID
            // 之后插入数据
            _db.ship_types.count({}, function (err, count) {
                data['id'] = parseInt(count) + 1
                _db.ship_types.insert(
                    data,
                    callback
                );
            })
        })
    self.field_input_text('code', '舰种简称').appendTo(form)
    self.field_input_text('code_game', '舰种简称 (游戏中)').appendTo(form)
    self.field_input_text('name.en_us', '舰种全称').appendTo(form)
    self.field_input_text('name.ja_jp', '舰种全称 (游戏中)').appendTo(form)
    self.field_input_text('name.zh_cn', '舰种全称 (中文)').appendTo(form)

    var input_id = '_input_g' + _g.inputIndex
    _g.inputIndex++
    $('<input type="checkbox" name="donotcompare" id="' + input_id + '">')
        .prop('checked', false)
        .appendTo(form)
    $('<label for="' + input_id + '"/>').html('不参与属性表对比').appendTo(form)

    self.field_actions().appendTo(form)

    return form
}

_frame.app_main.page['ships'].gen_form_new_ship_class = function (callback) {
    callback = callback || function () { }

    var self = _frame.app_main.page['ships'].section['舰种&舰级']
        , form = $('<form class="ship_class loading"/>').on('submit', function (e) {
            e.preventDefault()
            var data = $(this).serializeObject()

            // 获取当前共有多少舰级，确定新建舰级的数字ID
            // 之后插入数据
            _db.ship_classes.count({}, function (err, count) {
                data['id'] = parseInt(count) + 1
                _db.ship_classes.insert(
                    data,
                    callback
                );
            })
        })

    self.field_input_text('name.ja_jp', '舰级名 (游戏中)', null, '型').appendTo(form)
    self.field_input_text('name.zh_cn', '舰级名 (中文)', null, '级').appendTo(form)

    var line = $('<p/>').appendTo(form)
        , select = $('<select name="ship_type_id" required/>').html('<option value=""></option>').appendTo(form)

    _db.ship_types.find({}).sort({ 'code': 1, 'full': 1 }).exec(function (err, docs) {
        if (!err) {
            for (var i in docs) {
                var _data = docs[i]
                $('<option/>', {
                    'value': _data['id'],
                    'html': '[' + _data['code'] + '] ' + _data.name.zh_cn
                }).appendTo(select)
            }
            form.removeClass('loading')
        }
    })

    self.field_actions().appendTo(form)

    return form
}

_frame.app_main.page['ships'].gen_form_new_ship_suffix = function (callback, data_edit, callback_remove) {
    callback = callback || function () { }
    let is_edit = (data_edit)
    var self = _frame.app_main.page['ships'].section['舰种&舰级']
        , form = $('<form class="ship_suffix' + (is_edit ? ' loading' : '') + '"/>').on('submit', function (e) {
            e.preventDefault()
            var data = $(this).serializeObject()

            if (is_edit) {
                // 编辑操作
                _db.ship_namesuffix.update({
                    '_id': data_edit['_id']
                }, {
                        $set: data
                    }, {}, function (err, numReplaced) {
                        callback(data)
                        _frame.modal.hide()
                    });
            } else {
                // 新建操作
                // 获取当前总数，确定数字ID
                // 之后插入数据
                _db.ship_namesuffix.count({}, function (err, count) {
                    data['id'] = parseInt(count) + 1
                    _db.ship_namesuffix.insert(
                        data,
                        callback
                    );
                })
            }
        })
    self.field_input_text('ja_jp', '日', is_edit ? data_edit['ja_jp'] : null).appendTo(form)
    self.field_input_text('ja_romaji', '罗马音', is_edit ? data_edit['ja_romaji'] : null).appendTo(form)
    self.field_input_text('zh_cn', '简中', is_edit ? data_edit['zh_cn'] : null).appendTo(form)

    self.field_actions(
        is_edit ? '更新' : null,
        callback_remove ? function () {
            _db.ship_namesuffix.remove({ _id: data_edit['_id'] }, {}, function (err, numRemoved) {
                callback_remove()
                _frame.modal.hide()
            });
        } : null
    ).appendTo(form)

    return form
}

_frame.app_main.page['ships'].gen_form_new_ship_type_collection = function (callback, data_edit, callback_remove) {
    callback = callback || function () { }
    let is_edit = (data_edit)
    var types = is_edit ? data_edit['types'] : []
    var self = _frame.app_main.page['ships'].section['舰种&舰级']
        , form = $('<form class="ship_type_collection"/>').on('submit', function (e) {
            e.preventDefault()
            var data = $(this).serializeObject()
            if (typeof data['types'] != 'object' && typeof data['types'] != 'undefined')
                data['types'] = [data['types']]

            if (is_edit) {
                // 编辑操作
                _db.ship_type_collections.update({
                    '_id': data_edit['_id']
                }, {
                        $set: data
                    }, {}, function (err, numReplaced) {
                        callback(data)
                        _frame.modal.hide()
                    });
            } else {
                // 新建操作
                // 获取当前总数，确定数字ID
                // 之后插入数据
                _db.ship_type_collections.count({}, function (err, count) {
                    data['id'] = parseInt(count) + 1
                    _db.ship_type_collections.insert(
                        data,
                        callback
                    );
                })
            }
        })

    self.field_input_text('name.zh_cn', '简中', is_edit ? data_edit['name']['zh_cn'] : null).appendTo(form)

    // 舰种信息
    _db.ship_types.find({}).sort({ 'id': 1 }).exec(function (err, docs) {
        for (var i in docs) {
            var type_id = parseInt(docs[i]['id'])
                , input_id = '_input_g' + _g.inputIndex
            _g.inputIndex++
            $('<input type="checkbox" name="types" value="' + type_id + '" id="' + input_id + '"/>')
                .prop('checked', ($.inArray(type_id, types) > -1))
                .appendTo(form)
            $('<label for="' + input_id + '"/>').html(docs[i].name.zh_cn).appendTo(form)
            $('<br/>').appendTo(form)
        }

        self.field_actions(
            is_edit ? '更新' : null,
            callback_remove ? function () {
                _db.ship_type_collections.remove({ _id: data_edit['_id'] }, {}, function (err, numRemoved) {
                    callback_remove()
                    _frame.modal.hide()
                });
            } : null
        ).appendTo(form)
    })

    return form
}

_frame.app_main.page['ships'].gen_form_new_ship_type_order = function (callback, data_edit, callback_remove) {
    callback = callback || function () { }
    let is_edit = (data_edit)
    var types = is_edit ? data_edit['types'] : []
    var self = _frame.app_main.page['ships'].section['舰种&舰级']
        , form = $('<form class="ship_type_collection"/>').on('submit', function (e) {
            e.preventDefault()
            var data = $(this).serializeObject()
            if (typeof data['types'] != 'object' && typeof data['types'] != 'undefined')
                data['types'] = [data['types']]

            if (is_edit) {
                // 编辑操作
                _db.ship_type_order.update({
                    '_id': data_edit['_id']
                }, {
                        $set: data
                    }, {}, function (err, numReplaced) {
                        callback(data)
                        _frame.modal.hide()
                    });
            } else {
                // 新建操作
                // 获取当前总数，确定数字ID
                // 之后插入数据
                _db.ship_type_order.count({}, function (err, count) {
                    data['id'] = parseInt(count) + 1
                    _db.ship_type_order.insert(
                        data,
                        callback
                    );
                })
            }
        })

    self.field_input_text('name.zh_cn', '简中', is_edit ? data_edit['name']['zh_cn'] : null).appendTo(form)

    var input_id = '_input_g' + _g.inputIndex
    _g.inputIndex++
    $('<input type="checkbox" name="donotcompare" id="' + input_id + '">')
        .prop('checked', is_edit ? data_edit['donotcompare'] : null)
        .appendTo(form)
    $('<label for="' + input_id + '"/>').html('不参与属性表对比').appendTo(form)
    $('<hr/>').appendTo(form)

    // 舰种信息
    _db.ship_types.find({}).sort({ 'id': 1 }).exec(function (err, docs) {
        for (var i in docs) {
            var type_id = parseInt(docs[i]['id'])
                , input_id = '_input_g' + _g.inputIndex
            _g.inputIndex++
            $('<input type="checkbox" name="types" value="' + type_id + '" id="' + input_id + '">')
                .prop('checked', ($.inArray(type_id, types) > -1))
                .appendTo(form)
            $('<label for="' + input_id + '"/>').html(docs[i].name.zh_cn).appendTo(form)
            $('<br/>').appendTo(form)
        }

        self.field_actions(
            is_edit ? '更新' : null,
            callback_remove ? function () {
                _db.ship_type_order.remove({ _id: data_edit['_id'] }, {}, function (err, numRemoved) {
                    callback_remove()
                    _frame.modal.hide()
                });
            } : null
        ).appendTo(form)
    })

    return form
}

















_frame.app_main.page['ships'].init = function (page) {
    page.find('section').on({
        'tabview-show': function () {
            var section = $(this)
                , name = section.data('tabname')

            if (!_frame.app_main.page['ships'].section[name])
                _frame.app_main.page['ships'].section[name] = {}

            var _o = _frame.app_main.page['ships'].section[name]

            if (!_o.is_init && _o.init) {
                _o.init(section)
                _o.is_init = true
            }
            switch (name) {
                case '未入库':
                    break;
            }
        }
    })
}









_frame.app_main.page['ships'].section['已入库'] = {
    'dom': {
    },

    'init': function (section) {
        _frame.app_main.page['ships'].section['已入库'].dom.section = section
    }
}














_frame.app_main.page['ships'].section['未入库'] = {
    'data': [],
    'data_length': 0,
    'dom': {},

    'append_table': function (section) {
        var container = $('<div class="fixed-table-container"/>').appendTo(section)
            , inner = $('<div class="fixed-table-container-inner"/>').appendTo(container)
            , table = $('<table class="ships hashover hashover-column"/>').appendTo(inner)
        function gen_thead(arr) {
            var thead = $('<thead/>')
                , tr = $('<tr/>').appendTo(thead)
            for (var i in arr) {
                if (parseInt(i)) {
                    $('<td/>').html('<div class="th-inner">' + arr[i] + '</div>').appendTo(tr)
                } else {
                    $('<th/>').html('<div class="th-inner">' + arr[i] + '</div>').appendTo(tr)
                }
            }
            return thead
        }
        gen_thead([
            ' ',
            //'ID',
            '火力',
            '雷装',
            '对空',
            '对潜',
            '耐久',
            '装甲',
            '回避',
            '搭载',
            '航速',
            '射程',
            '索敌',
            '运'
        ]).appendTo(table)
        var tbody = $('<tbody/>').appendTo(table)
            , _index = 0

        function raw_ship_data_convert(d) {
            var data = {
                'id': d['id'],
                'no': d['no'],
                'name': {
                    'ja_jp': d['name'],
                    'ja_kana': d['pron']
                },
                'stat': {
                    'fire': d['fire'],
                    'fire_max': d['max_fire'],
                    'torpedo': d['torpedo'],
                    'torpedo_max': d['max_torpedo'],
                    'aa': d['aac'],
                    'aa_max': d['max_aac'],
                    'asw': d['ass'],
                    'asw_max': d['max_ass'],

                    'hp': d['hp'],
                    'hp_max': d['max_hp'],
                    'armor': d['armor'],
                    'armor_max': d['max_armor'],
                    'evasion': d['evasion'],
                    'evasion_max': d['max_evasion'],
                    'carry': '',

                    'speed': d['speed'],
                    'range': d['range'],
                    'los': d['seek'],
                    'los_max': d['max_seek'],
                    'luck': d['luck'],
                    'luck_max': d['max_luck']
                },
                'consum': {
                    'fuel': d['fuel'],
                    'ammo': d['bullet']
                },
                'remodel': {
                    'prev': null,
                    'prev_lvl': null,
                    'next': d['next'] || null,
                    'next_lvl': d['nextlv'] || null
                },
                'slot': d['carry'],
                'equip': d['equip'],
                'rels': {}
            }

            var carry = 0
            for (var i in d['carry']) {
                carry += parseInt(d['carry'][i])
            }

            data.stat.carry = carry
            return data
        }
        function append_tbody_tr() {
            var ship_data = _frame.app_main.page["ships"].section["未入库"]["data"][_index]
            //if( ship_data && ship_data['name'] !== 'なし' && ship_data['id'] < 500 ){
            if (ship_data && ship_data['name'] !== 'なし') {
                var tr = $('<tr data-shipId="' + ship_data['id'] + '" data-shipModal="false"/>')
                    .on('click', function (e, data_modified) {
                        _frame.app_main.page['ships'].show_ship_form(
                            $.extend(
                                true,
                                raw_ship_data_convert(ship_data),
                                data_modified || {}
                            )
                        )
                    })
                    .appendTo(tbody)
                    , max_carry = 0
                for (var i in ship_data['carry']) {
                    max_carry += ship_data['carry'][i]
                }
                $('<th/>')
                    .html(
                        '<img src="../pics/ships/' + ship_data['id'] + '/0.png"/>'
                        + '<strong>' + ship_data['name'] + '</strong>'
                        //+ '<small>' + ship_data['pron'] + '</small>'
                    ).appendTo(tr)

                //$('<td/>').html(ship_data['id'] + ' / ' + ship_data['no']).appendTo(tr)

                $('<td class="stat-fire"/>').html(ship_data['max_fire']).appendTo(tr)
                $('<td class="stat-torpedo"/>').html(ship_data['max_torpedo']).appendTo(tr)
                $('<td class="stat-aa"/>').html(ship_data['max_aac']).appendTo(tr)
                $('<td class="stat-asw"/>').html(ship_data['max_ass']).appendTo(tr)

                $('<td class="stat-hp"/>').html(ship_data['hp']).appendTo(tr)
                $('<td class="stat-armor"/>').html(ship_data['max_armor']).appendTo(tr)
                $('<td class="stat-evasion"/>').html(ship_data['max_evasion']).appendTo(tr)
                $('<td class="stat-carry"/>').html(max_carry).appendTo(tr)

                $('<td class="stat-speed"/>').html(_g.getStatSpeed(ship_data['speed'])).appendTo(tr)
                $('<td class="stat-range"/>').html(_g.getStatRange(ship_data['range'])).appendTo(tr)
                $('<td class="stat-los"/>').html(ship_data['seek'] + '<sup>' + ship_data['max_seek'] + '</sup>').appendTo(tr)
                $('<td class="stat-luck"/>').html(ship_data['luck'] + '<sup>' + ship_data['max_luck'] + '</sup>').appendTo(tr)
            }
            _index++
            setTimeout(function () {
                append_tbody_tr()
            }, 1)
        }

        append_tbody_tr()

        return table
    },

    'init': function (section) {
        // 扫描未入库数据目录，生成表格
        node.fs.readdir(_g.path.fetched.ships, function (err, files) {
            for (var i in files) {
                node.fs.readFile(_g.path.fetched.ships + '/' + files[i], 'utf8', function (err, data) {
                    if (err)
                        throw err
                    eval('var _data = ' + data)
                    _frame.app_main.page["ships"].section["未入库"]["data"][_data['id']] = _data
                    _frame.app_main.page['ships'].section['未入库']["data_length"]++
                    if (_frame.app_main.page['ships'].section['未入库']["data_length"] >= files.length)
                        _frame.app_main.page['ships'].section['未入库'].dom.table
                            = _frame.app_main.page['ships'].section['未入库'].append_table(section)
                })
            }
            if (err || !files || !files.length) {
                $('<p/>').html('暂无内容...<br />请初始化数据').appendTo(section)
            }
        })
    }
}









_frame.app_main.page['ships'].section['舰种&舰级'] = {
    'dom': {
        'ship_class': {}
    },

    'field_input_text': function (name, title, value, suffix) {
        var line = $('<p/>')
            , label = $('<label/>').appendTo(line)
        $('<span/>').html(title).appendTo(label)
        $('<input type="text" required name="' + name + '" />').val(value).appendTo(label)
        if (suffix)
            $('<span/>').html(suffix).appendTo(label)
        return line
    },
    'field_actions': function (text, func_delete) {
        var line = $('<p class="actions"/>')
        $('<button type="submit"/>').html(text || '提交').appendTo(line)
        if (func_delete) {
            $('<button type="button"/>').html('删除').on('click', function () {
                func_delete()
            }).appendTo(line)
        }
        return line
    },






    // 返回HTML内容
    'content_ship_type': function (d) {
        return '<strong>' + d.name.zh_cn + '</strong>'
            + '<small>' + d.name.ja_jp + '</small>'
            + '<em>' + d['code'] + '</em>'
    },
    'content_ship_class': function (d) {
        return '<strong>' + d.name.zh_cn + '级</strong>'
            + '<small>' + d.name.ja_jp + '型</small>'
    },







    // 相关表单/按钮
    'titlebtn_ship_type': function (d) {
        var self = _frame.app_main.page['ships'].section['舰种&舰级']
            , btn = $('<button class="ship_type"/>').html(
                self.content_ship_type(d)
            ).on('click', function () {
                _frame.modal.show(
                    app.addTemplate({
                        templateUrl: './templates/form-ship-type.html'
                    }, { _id: d._id }
                    ), '编辑舰种')
                return
                // var _dom = $('<form class="ship_type loading"/>').on('submit', function (e) {
                //     e.preventDefault()
                //     if (!$(this).hasClass('submitting') && !$(this).hasClass('loading')) {
                //         $(this).addClass('submitting')
                //         var newdata = $(this).serializeObject()
                //         _db.ship_types.update({
                //             '_id': d['_id']
                //         }, {
                //                 $set: newdata
                //             }, {}, function (err, numReplaced) {
                //                 btn.html(self.content_ship_type(newdata))
                //                 _frame.modal.hide()
                //             });
                //     }
                // })
                // _db.ship_types.find({
                //     '_id': d['_id']
                // }, function (err, docs) {
                //     if (!err) {
                //         var _data = docs[0]
                //         var id = self.field_input_text('id', 'ID', _data['id']).appendTo(_dom)
                //         id.find('input').prop('readonly', true)
                //         self.field_input_text('code', '舰种简称', _data['code']).appendTo(_dom)
                //         self.field_input_text('code_game', '舰种简称 (游戏中)', _data['code_game']).appendTo(_dom)
                //         self.field_input_text('name.en_us', '舰种全称', _data.name.en_us).appendTo(_dom)
                //         self.field_input_text('name.ja_jp', '舰种全称 (游戏中)', _data.name.ja_jp).appendTo(_dom)
                //         self.field_input_text('name.zh_cn', '舰种全称 (中文)', _data.name.zh_cn).appendTo(_dom)
                //         var input_id = '_input_g' + _g.inputIndex
                //         _g.inputIndex++
                //         $('<input type="checkbox" name="donotcompare" id="' + input_id + '">')
                //             .prop('checked', _data['donotcompare'])
                //             .appendTo(_dom)
                //         $('<label for="' + input_id + '"/>').html('不参与属性表对比').appendTo(_dom)
                //         self.field_actions('更新', function () {
                //             // 删除操作
                //             _db.ship_types.remove({ _id: d['_id'] }, {}, function (err, numRemoved) {
                //                 btn.remove()
                //                 if (self.dom.ship_class[d._id])
                //                     self.dom.ship_class[d._id].remove()
                //                 _frame.modal.hide()
                //             });
                //         }).appendTo(_dom)
                //         _dom.removeClass('loading')
                //     }
                // })
                // _frame.modal.show(_dom, '编辑舰种')
            })
        return btn
    },








    // 新建完毕，添加内容
    'add_ship_type': function (d) {
        var self = _frame.app_main.page['ships'].section['舰种&舰级']

        // 舰种标题，同时也是编辑按钮
        self.titlebtn_ship_type(d).appendTo(self.dom.section)

        // 该舰种舰级DOM
        self.dom.ship_class[d.id] = _p.el.flexgrid.create().addClass('ship_classes').appendTo(self.dom.section)

        // 载入该舰种全部舰级
        _db.ship_classes.find({
            'ship_type_id': d['id']
        }, function (err, docs) {
            if (!err) {
                for (var i in docs) {
                    self.add_ship_class(docs[i])
                }
            }
        })
    },

    'add_ship_class': function (d) {
        if (!d)
            return false
        var self = _frame.app_main.page['ships'].section['舰种&舰级']
        self.dom.ship_class[d.ship_type_id].appendDOM(
            $('<button class="unit"/>').html(self.content_ship_class(d))
                .on('click', function (e) {
                    _frame.modal.show(
                        app.addTemplate({
                            templateUrl: './templates/form-ship-class.html'
                        }, {
                                _id: d._id
                            }
                        ), '编辑舰级')
                })
        )
    },










    'init': function (section) {
        var self = _frame.app_main.page['ships'].section['舰种&舰级']

        // 新建按钮
        self.dom.new_container = $('<div class="new_container"/>').appendTo(section)
        self.dom.ship_type_new = $('<button/>').html('新建舰种').on('click', function () {
            _frame.modal.show(
                _frame.app_main.page['ships'].gen_form_new_ship_type(
                    function (err, newDoc) {
                        self.add_ship_type(newDoc)
                        _frame.modal.hide()
                    }
                ), '新建舰种')
        }).appendTo(self.dom.new_container)
        self.dom.ship_class_new = $('<button/>').html('新建舰级').on('click', function () {
            _frame.modal.show(
                _frame.app_main.page['ships'].gen_form_new_ship_class(
                    function (err, newDoc) {
                        self.add_ship_class(newDoc)
                        _frame.modal.hide()
                    }
                ), '新建舰级')
        }).appendTo(self.dom.new_container)

        // 读取舰种表，创建内容
        self.dom.section = $('<div class="main"/>').appendTo(section)
        _db.ship_types.find({}).sort({ 'code': 1, 'full': 1 }).exec(function (err, docs) {
            if (!err) {
                for (var i in docs) {
                    self.add_ship_type(docs[i])
                }
            }
        })

    }
}









_frame.app_main.page['ships'].section['后缀名'] = {
    'dom': {},
    // 返回HTML内容
    'content_ship_suffix': function (d) {
        return '<strong>' + d['zh_cn'] + '</strong>'
            + '<small>' + d['ja_jp'] + '</small>'
    },







    // 相关表单/按钮
    'titlebtn_ship_suffix': function (d) {
        var self = _frame.app_main.page['ships'].section['后缀名']
            , btn = $('<button class="ship_suffix"/>').html(
                self.content_ship_suffix(d)
            ).on('click', function () {
                _frame.modal.show(
                    _frame.app_main.page['ships'].gen_form_new_ship_suffix(
                        function (newdata) {
                            btn.html(self.content_ship_suffix(newdata))
                        },
                        d,
                        function () {
                            btn.remove()
                        }
                    ), '编辑后缀名')
            })
        return btn
    },








    // 新建完毕，添加内容
    'add_ship_suffix': function (d) {
        var self = _frame.app_main.page['ships'].section['后缀名']

        // 舰种标题，同时也是编辑按钮
        self.titlebtn_ship_suffix(d).appendTo(self.dom.section)
    },










    'init': function (section) {
        var self = _frame.app_main.page['ships'].section['后缀名']

        // 新建按钮
        self.dom.new_container = $('<div class="new_container"/>').appendTo(section)
        self.dom.btnnew = $('<button/>').html('新建').on('click', function () {
            _frame.modal.show(
                _frame.app_main.page['ships'].gen_form_new_ship_suffix(
                    function (err, newDoc) {
                        self.add_ship_suffix(newDoc)
                        _frame.modal.hide()
                    }
                ), '新建舰名后缀')
        }).appendTo(self.dom.new_container)

        // 读取舰种表，创建内容
        self.dom.section = $('<div class="main"/>').appendTo(section)
        _db.ship_namesuffix.find({}).sort({ 'code': 1, 'full': 1 }).exec(function (err, docs) {
            if (!err) {
                for (var i in docs) {
                    self.add_ship_suffix(docs[i])
                }
            }
        })

    }
}









_frame.app_main.page['ships'].section['新建'] = {
    'dom': {
    },

    'init': function (section) {
        var self = _frame.app_main.page['ships'].section['新建']
        _frame.app_main.page['ships'].section['新建'].dom.section = section

        // 创建form
        self.dom.form = $('<form/>')
            .on('submit', function (e) {
                e.preventDefault();
                var formdata = self.dom.form.serializeObject()
                    , ship_data = {
                        'name': {},
                        'stat': {},
                        'consum': {},
                        'slot': [],
                        'equip': []
                    }
                console.log(formdata)
                if (formdata.remodel_from && formdata.remodel_from > -1) {
                    let remodel_from = _g.data.ships[formdata.remodel_from]
                    ship_data['name'] = remodel_from['name']
                    ship_data['type'] = remodel_from['type']
                    ship_data['class'] = remodel_from['class']
                    ship_data['class_no'] = remodel_from['class_no']
                    // ship_data['rels'] = remodel_from['rels']
                    ship_data['series'] = remodel_from['series']
                    ship_data['remodel'] = {
                        'prev': remodel_from['id']
                    }

                    delete ship_data['name']['suffix']
                } else {

                }
                if (formdata['id'])
                    ship_data['id'] = formdata['id']

                if (formdata['no'])
                    ship_data['no'] = formdata['no']

                _frame.app_main.page['ships'].show_ship_form(
                    ship_data
                )
            })
            .data({
                'ship_data': {}
            })
            .appendTo(section)

        var id = '_input_g' + _g.inputIndex
        _g.inputIndex++
        $('<p/>')
            .append(
                $('<label for="' + id + '"/>').html('ID')
            )
            .append(
                $('<input id="' + id + '" type="number" name="id"/>')
            )
            .appendTo(self.dom.form)
        $('<p/>')
            .append(
                $('<label for="' + id + '"/>').html('图鉴ID')
            )
            .append(
                $('<input id="' + id + '" type="number" name="no"/>')
            )
            .appendTo(self.dom.form)

        var id = '_input_g' + _g.inputIndex
        _g.inputIndex++
        var remodelFrom = $('<p/>')
            .append(
                $('<label for="' + id + '"/>').html('改造自')
            )
            .appendTo(self.dom.form)
        _comp.selector_ship('remodel_from', id).appendTo(remodelFrom)
        /*
        var remodelFromSelect = $('<select name="remodel_from" id="'+id+'"/>')
                            .append(
                                $('<option value="-1"/>').html('---无---')
                            )
                            .appendTo(remodelFrom)

        // 载入全部舰娘信息
            _db.ships.find({}).sort({'name.ja_jp':1}).exec(function(err, docs){
                for( var i in docs ){
                    self.dom.form.data('ship_data')[docs[i]['id']] = docs[i]
                    $('<option value="'+ docs[i]['id'] +'"/>')
                        .html(
                            (docs[i]['name']['zh_cn'] || docs[i]['name']['ja_jp'])
                            + (docs[i]['name']['suffix']
                                ? '・' + _g.data.ship_namesuffix[docs[i]['name']['suffix']]['zh_cn']
                                : '')
                        )
                        .appendTo(remodelFromSelect)
                }
            })
            */

        $('<p class="actions"/>')
            .append(
                $('<button type="submit"/>').html('新建')
            )
            .appendTo(self.dom.form)

    }
}









_frame.app_main.page['ships'].section['舰种集合 (舰娘列表)'] = {
    'dom': {
    },

    // 返回HTML内容
    'content': function (d) {
        return '<strong>' + d['name']['zh_cn'] + '</strong>'
    },

    // 相关表单/按钮
    'titlebtn': function (d) {
        var self = _frame.app_main.page['ships'].section['舰种集合 (舰娘列表)']
            , dom = $('<div class="ship_type_collection"/>')
        $('<button class="ship_type_collection"/>').html(
            self.content(d)
        ).on('click', function () {
            _frame.modal.show(
                _frame.app_main.page['ships'].gen_form_new_ship_type_order(
                    function (newdata) {
                        self.titlebtn(newdata)
                            .insertAfter(dom)
                        dom.remove()
                    },
                    d,
                    function () {
                        dom.remove()
                    }
                ), '编辑舰种集合')
        }).appendTo(dom)

        var types = $('<div/>').appendTo(dom)
        for (var i in d['types']) {
            $('<span/>').html(
                _g.data.ship_types[d['types'][i]].name.zh_cn
                + (parseInt(i) < d['types'].length - 1 ? ', ' : '')
            ).appendTo(types)
        }

        return dom
    },

    // 新建完毕，添加内容
    'add': function (d) {
        var self = _frame.app_main.page['ships'].section['舰种集合 (舰娘列表)']
        /*
            {
                id 			// order
                name
                    zh_cn
                types
            }
        */
        // 舰种标题，同时也是编辑按钮
        self.titlebtn(d).appendTo(self.dom.ship_type_order)
    },

    'init': function (section) {
        var self = _frame.app_main.page['ships'].section['舰种集合 (舰娘列表)']
        _frame.app_main.page['ships'].section['舰种集合 (舰娘列表)'].dom.section = section

        var types_collected = []

        // 新建按钮
        self.dom.new_container = $('<div class="new_container"/>').appendTo(section)
        self.dom.btnnew = $('<button/>').html('新建').on('click', function () {
            _frame.modal.show(
                _frame.app_main.page['ships'].gen_form_new_ship_type_order(
                    function (err, newDoc) {
                        self.add(newDoc)
                        _frame.modal.hide()
                    }
                ), '新建舰种集合')
        }).appendTo(self.dom.new_container)

        // 舰种集合列表
        self.dom.ship_type_order = $('<div class="ship_type_collections"/>').appendTo(section)

        // 读取舰种集合db，初始化内容
        _db.ship_type_order.find({}).sort({ 'id': 1 }).exec(function (err, docs) {
            if (!err && docs && docs.length) {
                for (var i in docs) {
                    self.add(docs[i])
                }
            }
        })
    }
}









_frame.app_main.page['ships'].section['舰种集合 (舰娘选择器)'] = {
    'dom': {
    },

    // 返回HTML内容
    'content': function (d) {
        return '<strong>' + d['name']['zh_cn'] + '</strong>'
    },

    // 相关表单/按钮
    'titlebtn': function (d) {
        var self = _frame.app_main.page['ships'].section['舰种集合 (舰娘选择器)']
            , dom = $('<div class="ship_type_collection"/>')
        $('<button class="ship_type_collection"/>').html(
            self.content(d)
        ).on('click', function () {
            _frame.modal.show(
                _frame.app_main.page['ships'].gen_form_new_ship_type_collection(
                    function (newdata) {
                        self.titlebtn(newdata)
                            .insertAfter(dom)
                        dom.remove()
                    },
                    d,
                    function () {
                        dom.remove()
                    }
                ), '编辑舰种集合')
        }).appendTo(dom)

        var types = $('<div/>').appendTo(dom)
        for (var i in d['types']) {
            $('<span/>').html(
                _g.data.ship_types[d['types'][i]].name.zh_cn
                + (parseInt(i) < d['types'].length - 1 ? ', ' : '')
            ).appendTo(types)
        }

        return dom
    },

    // 新建完毕，添加内容
    'add': function (d) {
        var self = _frame.app_main.page['ships'].section['舰种集合 (舰娘选择器)']
        /*
            {
                id 			// order
                name
                    zh_cn
                types
            }
        */
        // 舰种标题，同时也是编辑按钮
        self.titlebtn(d).appendTo(self.dom.ship_type_collections)
    },

    'init': function (section) {
        var self = _frame.app_main.page['ships'].section['舰种集合 (舰娘选择器)']
        _frame.app_main.page['ships'].section['舰种集合 (舰娘选择器)'].dom.section = section

        var types_collected = []

        // 新建按钮
        self.dom.new_container = $('<div class="new_container"/>').appendTo(section)
        self.dom.btnnew = $('<button/>').html('新建').on('click', function () {
            _frame.modal.show(
                _frame.app_main.page['ships'].gen_form_new_ship_type_collection(
                    function (err, newDoc) {
                        self.add(newDoc)
                        _frame.modal.hide()
                    }
                ), '新建舰种集合')
        }).appendTo(self.dom.new_container)

        // 舰种集合列表
        self.dom.ship_type_collections = $('<div class="ship_type_collections"/>').appendTo(section)

        // 读取舰种集合db，初始化内容
        _db.ship_type_collections.find({}).sort({ 'id': 1 }).exec(function (err, docs) {
            if (!err && docs && docs.length) {
                for (var i in docs) {
                    self.add(docs[i])
                }
            }
        })
    }
}
