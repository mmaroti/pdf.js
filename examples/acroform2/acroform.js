var ACROFORM = (function() {
	function renderPdf(pdfUrl, divId) {
		return PDFJS.getDocument(pdfUrl).then(function(pdf) {
			var div = document.getElementById(divId);
			var jobs = [];
			for (var i = 1; i <= pdf.numPages; i++)
				jobs.push(renderPage(pdf, i, div));

			return Promise.all(jobs);
		});
	}

	function renderPage(pdf, pageNo, div) {
		return pdf.getPage(pageNo).then(function(page) {
			var canvas = document.createElement('canvas');
			canvas.style.border = '1px solid black';
			div.appendChild(canvas);
			div.appendChild(document.createElement('br'));

			var scale = 0.25;
			var viewport = page.getViewport(scale);
			canvas.height = viewport.height;
			canvas.width = viewport.width;

			var renderContext = {
				canvasContext: canvas.getContext('2d'),
				viewport: viewport
			};

			return page.render(renderContext).then(function() {
				return renderForm(page);
			});
		});
	}

	function renderForm(page) {
		return page.getAnnotations().then(function(fields) {
			for (var i = 0; i < fields.length; i++) {
				var field = fields[i];
				console.log(field);
			}
		});
	}

	return renderPdf;
})();
