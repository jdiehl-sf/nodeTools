module.exports = (options) => ({
	name: `${options.name}`,
	description: '',
	collectionId: options.collectionId,
	pageTypeId: 3,
	asset: {
		meta: {
			globalStyles: {
				isLocked: false,
				body: {
					'max-width': '1280px'
				}
			}
		},
		contentType: 'text/html',
		assetType: {
			id: 205,
			name: 'webpage',
			displayName: 'Web Page'
		},
		version: 1,
		name: '423532',
		description: '',
		status: {
			id: 1,
			name: 'Draft'
		},
		favorite: true,
		views: {
			html: {
				meta: {},
				content: `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" /><meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /><style class="main_style">${options.style}</style><title>${options.name}</title></head><body>${options.content}</body></html>`,
				slots: {
					col1: {
						design: '<p style="font-family:arial;color:#ccc;font-size:11px;text-align:center;vertical-align:middle;font-weight:bold;padding:10px;margin:0;border:#ccc dashed 1px;">Drop blocks or content here</p>'
					}
				}
			}
		}
	},
	requiresSsl: true
});
