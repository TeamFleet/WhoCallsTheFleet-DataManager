// 
_frame.app_main.page['exillust'] = {
    section: {}
};

(() => {
    const exillust = _frame.app_main.page['exillust']
    const sections = exillust.section

    exillust.init = page => {
        page.find('section').on({
            'tabview-show': function () {
                const $section = $(this)
                const name = $section.data('tabname')

                if (!sections[name])
                    sections[name] = {}

                var _o = sections[name]

                if (!_o.is_init && _o.init) {
                    _o.init($section)
                    _o.is_init = true
                }
            }
        })
    }

    sections['类型'] = {
        init: $section => {
            app.addTemplate('./templates/exillust/types.html')
                .appendTo($section)
        }
    }

    sections['图鉴'] = {
        init: $section => {
            app.addTemplate('./templates/exillust/illusts.html')
                .appendTo($section)
        }
    }
})();
