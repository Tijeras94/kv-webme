// gallery object
//
// used to create image galleries of different
// layouts/types
// @author Conor Mac Aoidh <conormacaoidh@gmail.com>
var Gallery={
	options:{ // default options for the gallery
		display:'list',	// list, grid or custom
		items:6,	// columns, rows
		rows:1,
		thumbsize:90,	// thumbnail size
		links:true,	// set false to disable next and previous links
		hover:'opacity',	// "hover" effect
		click:'popup', // what to do when a large image is clicked
		effect:'fade',	// main image transition effect
		ratio:'normal',	// ratio of the thumbnails - normal or crop
		// this option adds partial support for changing the amount of items
		// loaded when the next/prev links are clicked. tested with vals 1 and 2
		listSwitch:2,
		galleryWidth:null,	// allow for manual override of the gallery width
		slideshow:false,
		slideshowTime:2500,	// slideshow interval between slide change
		directory:'',
		// custom display functions
		customDisplayInit:null,
		customDisplayNext:null,
		customDisplayPrevious:null,
		customDisplaySlideshow:null,
		customDisplayImageCallback:null,
		customDisplayCaption:null
	},
	// { local vars
	position:0, // keeps track of how far through the images array the grid display is
	width:0,
	current:0, // grid display - the count of how many items are displayed currently
	height:0,
	t:null, // used to hold the timeout for the slideshow function
	images:{}, // holds the images associated with this gallery. populated in init()
	cached_gallery:null,
	displayed:0, // have any images been displayed from the current list
	// }
	addLinksToLargeImage:function() {
		if (!this.options.links) {
			return;
		}
		$('#gallery-image .ad-image')
			.append('<div id="big-prev-link"/><div id="big-next-link"/>');
		$('#big-next-link,#big-prev-link')
			.css('height', this.options.imageHeight+'px');
	},
	applyFrame:function() {
		var src=this.src,$img=$(this);
		var newsrc='/i/blank.gif', bgoffset='0 0', newwidth=$img.width(),
			newheight=$img.height(),
			ratio=Gallery.options.imageWidth/Gallery.options.thumbsize;
		if (Gallery.frame.type) {
			var furl=Gallery.frame.type=='--custom--'
				?'/image-galleries/frame-'+window.pagedata.id+'.png'
				:'TODO';
			var padding=Gallery.frame.padding, border=Gallery.frame.border;
			newsrc='/a/p=image-gallery/f=frameGet/w='+newwidth+'/h='
				+newheight+'/pa='+padding+'/bo='+border+furl+'/ratio='+ratio;
		}
		$img
			.css({
				'background':'url("'+src+'") no-repeat '+bgoffset,
				'width'     :newwidth+'px',
				'height'    :newheight+'px'
			})
			.attr('src', newsrc);
	},
	bump:function(offset) { // bump effect
		var pos=parseInt($('#slider').css('left'));
		$('#slider').animate(
			{'left':(offset=='left')?(pos-20)+'px':(pos+20)+'px'}
			,200,function() {
			$(this).animate({'left':0},200);
		});
		return false;
	},
	closeWholepageImage:function() {
		$('.ad-image,.image-gallery-close-wholepage,#gallery-image').remove();
		$('div.ad-gallery,#image-gallery-nav').css('display', 'block');
	},
	count:function() { // counts the images object
		var size=0,key;
		for(key in this.images) {
			++size;
		}
		return size;
  },
	display:function() { // initial display function - gets called once
		this.displayImage(0);
		this.gallery().html('<div id="gallery-container"><div id="slider" style="width:100%"/></div>');
		if (this.options.display=='custom' && typeof(this.options.customDisplayInit)=='function') {
			return this.options.customDisplayInit();
		}
		var items=this.gallery().attr('cols');
		var dis=this.options.display;
		this.options.items=items?parseInt(items):(dis=='grid'?4:6);
		this.width=this.options.galleryWidth==null
			?(this.options.thumbsize+4)*this.options.items+4
			:this.options.galleryWidth;
		this.gallery().addClass(dis);
		if (dis=='grid') {
			var rows=this.gallery().attr('rows');
			this.options.rows=rows?parseInt(rows):4;
			this.displayGrid();
		}
		else {
			this.options.display='list';
			this.options.rows=1;
			var els=[];
			for(var i=0;i<this.options.items;++i) {
				els[i]=i;
			}
			var list=this.displayList(els);
			$('#slider').html(
				'<div class="images-container" style="overflow:hidden"><ul class='
				+'"ad-thumb-list" style="width:'+(this.width+400)+'px">'+list
				+'</ul></div>'
			);
			this.height=this.options.thumbsize+15;
			$('.ad-thumb-list').css('height', this.height+'px');
			this.addLinksToLargeImage();
		}
		this.gallery().css({'width':this.width+'px'});
		this.height=(this.options.thumbsize+15)*this.options.rows;
		$('#gallery-container').css('height', this.height+'px');
		if (this.options.links==true && !$('#image-gallery-nav').length) {
			this.gallery().append('<div id="prev-link"/><div id="next-link"/>');
			$('#next-link,#prev-link').css('height', this.height+'px');
		}
		$('.images-container img:first').addClass('image-selected');		
		if (this.options.slideshow=='true') { // activate slideshow
			setTimeout("Gallery.slideshow()", this.options.slideshowTime);
		}
		this.updateNav();
	},
	displayGrid:function() { // shows the grid display using a carousel
		var file, size=this.options.thumbsize, row=0, j;
		var html='<table class="images-container" style="width:100%"><tr>';
		this.current=0;
		$.each(this.images,function(i) {
			if(i%Gallery.options.items==0) {
				++row;
				html+='</tr><tr>';
			}
			j=Gallery.position;
			if(row==(Gallery.options.rows+1)||!Gallery.images[j]) {
				return false;
			}
			file=Gallery.images[j];
			html+='<td style="width:'+size+'px;height:'+size+'px">'
				+Gallery.mediaDisplay(file,i)+'</td>';
			++Gallery.position;
			++Gallery.current;
		});
		html+='</tr></table>';
		$('#slider')
			.append(html)
			.find('img')
			.one('load', Gallery.applyFrame);
	},
	displayImage:function(e) { // displays the main "big" image if present
		$('#image-gallery-video_wrapper').remove();
		var $imgwrap=$('.ad-image');
		if (!$imgwrap.length && this.displayed) {
			$('<a href="javascript:Gallery.closeWholepageImage()" '
				+'class="image-gallery-close-wholepage">back</a>')
				.appendTo('#image-gallery-wrapper');
			$imgwrap=$('<div id="gallery-image">'
				+'<div class="ad-image wholepage">'
				+'<h1 class="caption"/>'
				+'<img/>'
				+'<p class="description"/>'
				+'<em style="display:block;text-align:right" class="author"/>'
				+'</div></div>')
				.appendTo('#image-gallery-wrapper');
			this.addLinksToLargeImage();
			$('div.ad-gallery,#image-gallery-nav').css('display', 'none');
		}
		var $img=$imgwrap.find('img');
		var files=this.images;
		if(!files[e]) {
			return;
		}
		var current=$img.attr('num');
		var sequence=[];
		for (var i=0;i<files.length;++i) {
			sequence[i]=files[i].id;
			if (files[i].caption == undefined) {
				files[i].caption='';
			}
			if (files[i].author == undefined) {
				files[i].author='';
			}
			if (files[i].description == undefined) {
				files[i].description='';
			}
		}
		switch(files[e].media) {
			case 'image': // {
				var src=files[e].url+'/w='+this.options.imageWidth+'/h='+this.options.imageHeight;
				$img
					.hide()
					.css({'width':'auto','height':'auto'})
					.attr('src', src)
					.attr('title',files[e].caption)
					.attr('num',e)
					.attr('sequence', sequence)
					.one('load',function() {
						var newsrc='/i/blank.gif', bgoffset='0 0', newwidth=$img.width(),
							newheight=$img.height();
						if (Gallery.frame.type) {
							var furl=Gallery.frame.type=='--custom--'
								?'/image-galleries/frame-'+window.pagedata.id+'.png'
								:'TODO';
							var padding=Gallery.frame.padding, border=Gallery.frame.border;
							newsrc='/a/p=image-gallery/f=frameGet/w='+newwidth+'/h='
								+newheight+'/pa='+padding+'/bo='+border+furl;
						}
						$img
							.css({
								'background':'url("'+src+'") no-repeat '+bgoffset,
								'width'     :newwidth+'px',
								'height'    :newheight+'px'
							})
							.attr('src', newsrc);
						$imgwrap.css({'width':newwidth+'px','height':Gallery.options.imageHeight+'px'});
						$imgwrap.closest('#gallery-image').css({'width':newwidth+'px','height':Gallery.options.imageHeight+'px'});
						switch(Gallery.options.effect) {
    		      case 'fade': 
        		    $img.fadeIn('slow',Gallery.displayImageCallback); 
          		break; 
          		case 'slideVertical': 
								$img.show('slide',{'direction':(current<e?'up':'down')},500,Gallery.displayImageCallback);
							break; 
          		case 'slideHorizontal': 
								$img.show('slide',{'direction':(current<e?'right':'left')},500,Gallery.displayImageCallback);
          		break; 
						}
					});
			break; // }
			case 'video': // {
				$.getScript('/ww.plugins/image-gallery/frontend/jwplayer.js',function() {
					var width=Gallery.options.imageWidth;
					var height=Gallery.options.imageHeight;
					$imgwrap.css({'width':width+'px','height':height+'px'});
					$img
						.hide()
						.attr('src','')
						.attr('title','')
						.attr('num',e)
						.attr('sequence',sequence);
					$imgwrap.append('<div id="image-gallery-video" style="display:none"></div>');
					jwplayer('image-gallery-video').setup({
						'flashplayer':'/ww.plugins/image-gallery/frontend/player.swf',
						'file':files[e].href,
						'height':height,
						'width':width
					});
					jwplayer().setVolume(70);
					jwplayer().play();
					Gallery.displayImageCallback();
				});
			break; // }
		}
		this.displayed++; // mark that at least one image has been displayed
	},
	displayImageCallback:function() { // executed when display image animation complete
		if(typeof(Gallery.options.customDisplayCaption)=='function') {
			return Gallery.options.customDisplayCaption();
		}
		var $img=$('.ad-image img');
		var index=+$img.attr('num'), idata=Gallery.images[index];
		// { madly over-coded caption stuff
		var caption=idata.caption;
		var $caption=$('.ad-image .caption');
		if (caption=="") {
			$caption.hide();
		}
		else {
			var width=$img.width()-14;
			var offset=$img.height();
			var $caption=$('.ad-image .caption');
			$caption
				.html(caption)
				.css('width', width+'px');
			var height=$caption.height();
			$caption
				.css({'top':(offset-height)+'px'})
				.fadeIn('fast');
		}
		// }
		// { author, description
		$('.ad-image .author').html(idata.author);
		$('.ad-image .description').html(idata.description);
		// }
		if(typeof(Gallery.options.customDisplayImageCallback)=='function') {
			return Gallery.options.customDisplayImageCallback();
		}
	},
	displayList:function(els) { // displays elements from this.images in a list
		var file,size=this.options.thumbsize,html='',i;
		for(i=els[0];i<=els[els.length-1];++i) {
			if(!Gallery.images[i]) {
				return i==els[0]?false:html;
			}
			file=Gallery.images[i];
			html+='<li style="width:'+size+'px;">'
				+Gallery.mediaDisplay(file)
				+ '</li>';
			++Gallery.position;
		};
		return html;
	},
	displayNext:function(num) { // displays the next "page" of content
		switch(this.options.display) {
			case 'custom': // {
				if(typeof(this.options.customDisplayNext)=='function') {
					return this.options.customDisplayNext();
				}
				this.options.display='list'; // }
			case 'list': // {
				if($('.ad-thumb-list').hasClass('working')) {
					return;
				}
				$('.ad-thumb-list').addClass('working');
				var current=parseInt($('.ad-thumb-list li:last a').attr('id'));
				var max=(num==null)?this.options.listSwitch:num,width=0;
				var left=parseInt($('#slider').css('left'));
				var list=[];
				for(var i=1;i<=max;++i) {
					list[i-1]=current+i;
				}
				var item=this.displayList(list);
				if(item==false) {
					this.position=0;
					var list=[];
					for(var i=0;i<max;++i) {
						list[i]=i;
					}
					item=this.displayList(list);
				}
				var count=item.split('li');
				count=(count.length-1)/2;
				for(var i=0;i<count;++i) {
					width+=$('.ad-thumb-list li:eq('+i+')').width();
				}
				$('.ad-thumb-list').append(item);
				$('#slider').animate({
					'left':(left-width)+'px'
				},2000,function() {
					for(var i=0;i<count;++i) {
						$('.ad-thumb-list li:eq(0)').remove();
					}
					$('#slider').css('left', left+'px');
					$('.ad-thumb-list').removeClass('working')
				});
				break; // }
			case 'grid': // {
				if(this.position==this.count()) {
					return this.bump('left');
				}
				this.displayGrid();
				$('#slider .images-container:first')
					.css('left', '-'+this.width+'px');
				$('#slider .images-container:last')
					.css('left', 0);
				this.slide(this.width); // }
		}
		this.updateNav();
	},
	displayPrevious:function(num) { // does the opposite of displayNext
		switch(this.options.display) {
			case 'custom': // {
				if(typeof(this.options.customDisplayPrevious)=='function') {
					return this.options.customDisplayPrevious();
				}
				this.options.display='list'; // }
			case 'list': // {
				if($('.ad-thumb-list').hasClass('working')) {
					return;
				}
				$('.ad-thumb-list').addClass('working');
				var current=parseInt($('.ad-thumb-list li:first a').attr('id'));
				var max=(num==null)?this.options.listSwitch:num,width=0;
				var left=parseInt($('#slider').css('left'));
				var list=[];
				for(var i=1;i<=max;++i) {
					list[(i-1)]=(current+(i-max)-1);
				}
				var item=this.displayList(list);
				if(item==false) {
					var pos=this.count();
					var list=[];
					for(var i=1;i<=max;++i) {
						list[i-1]=(pos+i-max-1);
					}
					item=this.displayList([pos-2,pos-1]);
				}
				var count=item.split('li');
				count=(count.length-1)/2;
				for(var i=1;i<count;++i) {
					width+=$('.ad-thumb-list li:eq('+(this.options.items-i)+')').width();
				}
				$('.ad-thumb-list').prepend(item);
				$('#slider')
					.css('left', -width+'px')
					.animate({
						'left':left+'px'
					},2000,function() {
						for(var i=0;i<count;++i) {
							$('.ad-thumb-list li:last').remove();
						}
						$('.ad-thumb-list').removeClass('working');
					});
				break; // }
			case 'grid': // {
				if(this.position<=(this.options.rows*this.options.items)) {
					return this.bump('right');
				}
				this.position-=(this.options.rows*this.options.items)+this.current;
				$('.images-container').css({'left':this.width+'px'});
				this.displayGrid();
				this.slide(-this.width); // }
		}
		this.updateNav();
	},
	gallery:function() {
		if (!Gallery.cached_gallery) {
			Gallery.cached_gallery= $('.ad-gallery');
		}
		return Gallery.cached_gallery;
	},
	init:function() { // collects options from html and sets events
		// { get options from html
		var $gallery=this.gallery();
		var opts={};
		for (var k in this.options) {
			var val=$gallery.attr(k);
			if (val) {
				opts[k]=val;
			}
		}
		if (opts.links=='true') {
			opts.links=true;
		}
		$.extend(this.options, opts);
		this.options.thumbsize=parseInt(this.options.thumbsize);
		if (this.options.slideshow) {
			this.options.slideshowTime=$gallery.attr('slideshowtime');
		}
		var opts={}, names=["imageHeight","imageWidth","effect"];
		for(var k in names) {
			var val=$('#gallery-image').attr(names[k]);
			if(val) {
				opts[names[k]]=val;
			}
		}
		$.extend(this.options,opts);
		// }
		$.post('/a/p=image-gallery/f=galleryGet/id='+pagedata.id, {
				'image_gallery_directory':Gallery.options.directory
			}, function(ret) {
				Gallery.images=ret.items;
				Gallery.frame=ret.frame;
				Gallery.caption_in_slider=ret['caption-in-slider'];
				Gallery.options.imageHeight=ret['image-height']||350;
				Gallery.options.imageWidth=ret['image-width']||350;
				var length=Gallery.images.length;
				if (length==0) {
					return this.gallery().html('<p><i>No Images were found</i></p>');
				}
				else if (length==1) {
					Gallery.options.links=false;
				}
				Gallery.display();
			}, 'json');
		if(this.options.display=='grid') {
			$('#next-link, #prev-link')
				.live('click',function() {	
					if(Gallery.options.slideshow=='true') {
						Gallery.resetTimeout();
					}
					if($('.ad-thumb-list').hasClass('working')) {
						return;
					}
					return this.id=='next-link'
						?Gallery.displayNext()
						:Gallery.displayPrevious();
				});
		}
		if(this.options.display=='list') {
			$('#next-link, #prev-link')
				.live('mouseenter',function() {
					if(Gallery.options.slideshow=='true') {
						Gallery.resetTimeout();
					}
					$el=$(this).addClass('hover');
					setTimeout(function() {
						if ($el.hasClass('hover')) {
							$el.removeClass('hover').trigger('mouseenter');
							return this.id=='next-link'
								?Gallery.displayNext()
								:Gallery.displayPrevious();
						}
					},750);
				})
				.live('mouseleave',function() {
					$(this).removeClass('hover');
				});
		}
		if(this.options.hover=='zoom') {
			$('.images-container img')
				.live('mouseenter',function() {
					if(Gallery.options.slideshow=='true') {
						Gallery.resetTimeout();
					}
					$elm=$(this).addClass('img-hover');
					setTimeout(function() {
						if ($elm.hasClass('img-hover')) {
							var width, height;
							if (!$elm.attr('w')) {
								width=$elm.width();
								height=$elm.height();
								$elm
									.attr('w',width)
									.attr('h',height);
							}
							height=parseInt($elm.attr('h'))*1.25;
							width=parseInt($elm.attr('w'))*1.25;
							$elm
								.attr('t','true')
								.animate({
									'width':width+'px',
									'height':height+'px',
									'margin-left':'-12.5%',
									'margin-top':'-12.5%'
								},
									300,
									function() {
										$elm.attr('t','false');
									}
								).addClass('timeout');
							}
						},500);
				})
				.live('mouseleave',function() {
					if ($(this).removeClass('img-hover').hasClass('timeout')) {
						$(this).animate({
							'width':$(this).attr('w')+'px',
							'height':$(this).attr('h')+'px',
							'margin':'0'
						},
							300
						);
					}
				});
		}
		else if(this.options.hover=='opacity') {
			$('.images-container img')
				.live('mouseenter',function() {
					if(Gallery.options.slideshow=='true') {
						Gallery.resetTimeout();
					}
					if($(this).hasClass('image-selected')) {
						return;
					}
					if(!$(this).hasClass('working')) {
						$elm=$(this).addClass('working img-hover');
						$elm.animate({'opacity':'1'},function() {
							$elm.removeClass('working');
						});
					}
				})
				.live('mouseleave',function() {
					if($(this).hasClass('image-selected')) {
						return;
					}
					if(!$(this).hasClass('working')) {
						$elm=$(this).addClass('working');
						$elm.animate({'opacity':'0.7'},function() {
							$elm.removeClass('working img-hover');
						});
					}
				});
		}
		$('#gallery-image').css({
			'height':Gallery.options.imageHeight+'px',
			'width':Gallery.options.imageWidth+'px'
		});
		setTimeout(function() {
			$('#gallery-image').addClass('imagegallery-converted');
		}, 1000);
	},
	loadPage:function(num) { // shift the display to a specific page
		var imgsPerPage=Gallery.options.rows*Gallery.options.items;
		var oldPos=Gallery.position;
		var to=imgsPerPage*num;
		if (to>oldPos) {
			Gallery.current=imgsPerPage;
			Gallery.position=to-imgsPerPage;
			Gallery.displayNext();
		}
		else {
			Gallery.current=imgsPerPage;
			Gallery.position=to+imgsPerPage;
			Gallery.displayPrevious();
		}
	},
	mediaDisplay:function(file) {
		var size=this.options.thumbsize;
		var style=Gallery.options.ratio=='crop'
			?' style="width:'+size+'px;height:'+size+'px;overflow:hidden"':'';
		var popup=Gallery.options.hover=='popup'
			?' target="popup"'
			:(Gallery.options.hover=='opacity'?' style="opacity:0.7"':'');
		var xy=this.options.ratio=='normal'
			?[this.options.thumbsize,this.options.thumbsize]
			:file.height>file.width
				?[this.options.thumbsize, (file.height*(this.options.thumbsize/file.width))]
				:[(file.width*(this.options.thumbsize/file.height)), this.options.thumbsize];
		var caption=Gallery.caption_in_slider
			?'<br />'+file.caption
			:'';
		return '<a href="'+(file.media=='image'?file.url:file.href)+'" id="'
			+Gallery.position+'"'+popup+style+'><img src="'+file.url+'/w='
			+xy[0]+'/h='+xy[1]+'"/>'+caption+'</a>';
	},
	resetTimeout:function() { // resets the slideshow timeout
		clearTimeout(Gallery.t);
		Gallery.t=setTimeout("Gallery.slideshow()", Gallery.options.slideshowTime);
	},
	slide:function(w) {
		$('#slider')
			.css('left', w+'px')
			.animate({'left':0},1750,function() {
				$('#slider .images-container:first').remove();
			});
	},
	slideshow:function() { // creates a slideshow using settimeout
		if($('.ad-image').hasClass('working')) {
			return;
		}
		$('.ad-image').addClass('working');
		var n=parseInt($('.ad-image img').attr('num'));
		$('#'+n+' img').removeClass('image-selected');
		n=(n+1)==Gallery.count()?0:++n;
		$('#'+n+' img').addClass('image-selected');
		switch(this.options.display) {	
			case 'custom':
				if(typeof(this.options.customDisplaySlideshow)=='function') {
					return this.options.customDisplaySlideshow();
				}
				this.options.display='list';
			case 'list':	
				Gallery.displayNext(1);
				Gallery.displayImage(n);
				break;
			case 'grid':
				if(n!=0&&n%(this.options.items*this.options.rows)==0) {
					Gallery.displayNext();
				}
				else if(n==(this.count()-1)) {
					Gallery.displayPrevious();
				}
				Gallery.displayImage(n);
				break;
		}
		this.resetTimeout();
		$('.ad-image').removeClass('working');
	},
	updateNav:function() { // update page nav if there is one
		var $nav=$('#image-gallery-nav'), length=Gallery.images.length;
		if (!$nav.length) {
			return;
		}
		var imgsPerPage=Gallery.options.rows*Gallery.options.items,
			curPage=Math.ceil(Gallery.position/imgsPerPage),
			numPages=Math.ceil(Gallery.images.length/imgsPerPage);
		var links=[];
		for (var i=1;i<numPages+1;++i) {
			var link='<a href="javascript:Gallery.loadPage('+i+');"';
			if (i==curPage) {
				link+=' class="current"';
			}
			link+='>'+i+'</a>';
			links.push(link);
		}
		$nav.find('td.pagelinks').html(links.join(''));
	}
};

$(function() {
	Gallery.init();
});

$('.ad-image img').live('click', function() {
	if (Gallery.options.click=='wholepage') {
		return;
	}
	var $this=$(this), sequence=$this.attr('sequence').split(','), i;
	for (i=0;i<sequence.length;++i) {
		sequence[i]='/a/p=image-gallery/f=img/id='+sequence[i];
	}
	lightbox_show(
		$this.attr('src').replace(/,.*/, ''), sequence, $this.attr('num')
	);
})
$('#big-next-link').live('click',function() {
	if(Gallery.options.slideshow=='true') {
		Gallery.resetTimeout();
	}
	if(!$('.ad-thumb-list').hasClass('working')) {
			var n=parseInt($('.ad-image img').attr('num'));
			$('#'+n+' img').removeClass('image-selected');
			n=((n+1)==Gallery.count())?0:++n;
			$('#'+n+' img').addClass('image-selected');
			Gallery.displayNext(1);
			Gallery.displayImage(n);
	}
});
$('#big-prev-link').live('click',function() {
	if(Gallery.options.slideshow=='true') {
		Gallery.resetTimeout();
	}
	if(!$('.ad-thumb-list').hasClass('working')) {
		var n=parseInt($('.ad-image img').attr('num'));
		$('#'+n+' img').removeClass('image-selected');
		n=(n==0)?(Gallery.count()-1):--n;
		$('#'+n+' img').addClass('image-selected');
		Gallery.displayPrevious(1);
		Gallery.displayImage(n);
	}
});
$('.images-container a').live('click',function() {
	if(Gallery.options.slideshow=='true') {
		Gallery.resetTimeout();
	}
	var i=$(this).attr('id');
	$('.images-container img').removeClass('image-selected');
	$('img',this).addClass('image-selected');
	Gallery.displayImage(i);
	if(Gallery.options.hover!='popup') {
		return false;
	}
});
