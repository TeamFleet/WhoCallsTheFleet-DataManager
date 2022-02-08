"use strict";

_g.shipCapabilities = [
    {
        key: 'count_as_landing_craft',
        name: '算作：登陆艇',
        type: 'number',
    },
    {
        key: 'count_as_night_operation_aviation_personnel',
        name: '算作：夜间航空要员',
        type: 'number',
    },
    {
        key: 'participate_night_battle_when_equip_swordfish',
        name: '[CV] 当装备剑鱼时可参与夜战',
        type: 'checkbox',
    },
    {
        key: 'attack_surface_ship_prioritised',
        name: '[CV] 优先攻击水面舰',
        type: 'checkbox',
    },
    {
        key: 'leader_attack_pt_prioritised',
        name: '[DD] 对PT炮击领队',
        type: 'checkbox',
    },
    {
        key: 'anti_air_rocket_barrage',
        name: '对空弹幕',
        type: 'select',
        values: [
            {
                value: '',
                name: '❌'
            },
            {
                value: true,
                name: '✔'
            },
            {
                value: 'high',
                name: '✔ 可能性：高'
            }
        ]
    },
]
