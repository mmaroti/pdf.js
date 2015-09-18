var ACROFORM = (function() {
	function renderPdf(pdfUrl, divId) {
		return PDFJS.getDocument(pdfUrl).then(function(pdf) {
			var div = document.getElementById(divId);
			var form = document.createElement('form');
			form.style.position = 'relative';
			div.appendChild(form);

			return renderPage(pdf, form, 1, 0);
		});
	}

	function renderPage(pdf, form, pageNo, topPos) {
		if (pageNo > pdf.numPages) {
			return
		}

		return pdf.getPage(pageNo).then(function(page) {
			var canvas = document.createElement('canvas');
			canvas.style.border = '1px solid black';
			canvas.style.position = 'absolute';
			canvas.style.top = topPos + "px";
			form.appendChild(canvas);

			var scale = 1.5;
			var viewport = page.getViewport(scale);
			canvas.height = viewport.height;
			canvas.width = viewport.width;

			var renderContext = {
				canvasContext: canvas.getContext('2d'),
				viewport: viewport
			};

			return page.render(renderContext).then(function() {
				return renderForm(page, form, viewport, topPos);
			}).then(function() {
				return renderPage(pdf, form, pageNo + 1, topPos + canvas.height + 1);
			});
		});
	}

	function renderForm(page, form, viewport, topPos) {
		return page.getAnnotations().then(function(fields) {
			for (var i = 0; i < fields.length; i++) {
				var field = fields[i];
				if (field.fieldFlags & 1) {
					addHiddenField(field, form);
				}
				else if (field.fieldType === 'Btn') {
					if (field.fieldFlags & 65536) {
						addPushButton(field, form, viewport, topPos);
					}
					else if (field.fieldFlags & 32768) {
						addRadioButton(field, form, viewport, topPos);
					}
					else {
						addCheckBox(field, form, viewport, topPos);
					}
				}
			}
		});
	}

	function addHiddenField(field, form) {
		var input = document.createElement('input');
		input.type = 'hidden';
		input.name = field.fullName;
		input.value = field.fieldValue;
		form.appendChild(input);
	}

	function setPosition(input, field, viewport, topPos, offset) {
		var rect = viewport.convertToViewportRectangle(field.rect);
		rect = PDFJS.Util.normalizeRect(rect);
		input.style.left = Math.floor(rect[0] + offset[0]) + 'px';
		input.style.top = Math.floor(rect[1] + topPos + offset[1]) + 'px';
		input.style.width = Math.ceil(rect[2] - rect[0] + offset[2]) + 'px';
		input.style.height = Math.ceil(rect[3] - rect[1] + offset[3]) + 'px';
		input.style.position = 'absolute';
	}

	function addPushButton(field, form, viewport, topPos) {
		var input = document.createElement('input');
		input.name = field.fullName;
		input.value = field.buttonCaption;
		setPosition(input, field, viewport, topPos, [0,0,0,0]);
		if (field.actionType === 'SubmitForm') {
			input.type = 'submit';
			form.action = field.actionFile;
			if(field.actionFlags & 16) {
				form.method = 'get';
			}
			else {
				form.method = 'post';
			}
		}
		else {
			input.type = 'button';
		}
		form.appendChild(input);
	}

	function addRadioButton(field, form, viewport, topPos) {
	}

	function addCheckBox(field, form, viewport, topPos) {
		var input = document.createElement('input');
		input.type = 'radio';
		input.name = field.fullName;
		input.value = field.fieldValue;
		setPosition(input, field, viewport, topPos, [-4,-2,1,0]);
		form.appendChild(input);
	}

	return renderPdf;
})();
