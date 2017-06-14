class ItemBase {
	constructor(data) {
		$.extend(true, this, data)
	}

	getName(language){
		language = language || _g.lang
		return this['name']
				? (this['name'][language] || this['name'].ja_jp || this.name)
				: null
	}
	
	get _name(){
		return this.getName()
	}
}