if (!_g) var _g = window._g
if (!_p) var _p = window._p
if (!_db) var _db = window._db
if (!_frame) var _frame = window._frame
if (!app) var app = window.app;

(() => {
    _frame.app_main.page['exillust'] = {}
    _frame.app_main.page['exillust'].section = {}

    const exillust = _frame.app_main.page['exillust']
    const sections = exillust.section

    exillust.init = page => {
        page.find('section').on({
            'tabview-show': function () {
                var section = $(this)
                    , name = section.data('tabname')

                if (!sections[name])
                    sections[name] = {}

                var _o = sections[name]

                if (!_o.is_init && _o.init) {
                    _o.init(section)
                    _o.is_init = true
                }
            }
        })
    }

    sections['类型'] = {
        init: (section) => {
            console.log(section)
            $('<button/>', {
                html: '新建'
            }).on('click', function (e) {
                _frame.modal.show(
                    app.addTemplate({
                        templateUrl: './templates/form-exillust-type.html'
                    }),
                    '新建图鉴类型'
                )
            }).appendTo(section)
        }
    }

    sections['图鉴'] = {
        init: (section) => {
            app.addTemplate({
                templateUrl: './templates/exillust/illusts.html'
            }).appendTo(section)
        }
    }
})()