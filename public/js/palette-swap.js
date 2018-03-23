var config = {
    type: Phaser.CANVAS,
    parent: 'phaser-example',
    pixelArt: true,
    width: 240,
    height: 160,
    scene: {
        preload: preload,
        create: create
    }
};

var game = new Phaser.Game(config);

function preload ()
{
    // Load palette template.
    this.load.image('link-palette', '/assets/link-palette.png');

    // Load spritesheet we'll be manipulating.
    // Contains 3 animations with 10 frames each. 3 rows, 10 columns. 30 frames.
    this.load.spritesheet('link', '/assets/link.png', {
        frameWidth: 32,
        frameHeight: 32
    });
}

function create ()
{
    var animConfig = {
        paletteKey: 'link-palette',                         // Palette file we're referencing.
        paletteNames: ['green', 'red', 'blue', 'purple'],   // Names for each palette to build out the.
        spriteSheet: 'link',                                // Spritesheet we're manipulating.
        animations: ['walk-down', 'walk-left', 'walk-up']   // Names for each of the animations in the sheet.
    };

    // Create the dynamic texture atlases and animations.
    createPalettes(animConfig);

    console.log(this.textures);
    console.log(this.anims);

    // Add text.
    this.add.text(5, 5, "WASD: Change Animation");
    this.add.text(5, 20, "X: Change Palette");

    // Add sprite.
    var link = this.add.sprite(120, 80, 'link-green').setScale(2);

    // Set color and animation.
    link.color = 'green';
    link.anims.play('link-' + link.color + '-walk-down');

    // Handle Input.
    this.input.keyboard.on('keydown_W', function (event) {
        link.flipX = false;
        link.anims.play('link-' + link.color + '-walk-up');
    });

    this.input.keyboard.on('keydown_A', function (event) {
        link.flipX = false;
        link.anims.play('link-' + link.color + '-walk-left');
    });

    this.input.keyboard.on('keydown_S', function (event) {
        link.flipX = false;
        link.anims.play('link-' + link.color + '-walk-down');
    });

    this.input.keyboard.on('keydown_D', function (event) {
        link.flipX = true;
        link.anims.play('link-' + link.color + '-walk-left');
    });

    this.input.keyboard.on('keydown_X', function (event) {
        // TODO: Palette Swap.
        console.log('Change palette...');
    });
}

function createPalettes (config)
{
    // Create color lookup from palette image.
    var colorLookup = {};
    var x, y;
    var pixel, palette;
    var paletteWidth = game.textures.get(config.paletteKey).getSourceImage().width;

    // Go through each pixel in the palette image and add it to the color lookup.
    for (y = 0; y < config.paletteNames.length; y++) {
        palette = config.paletteNames[y];
        colorLookup[palette] = [];

        for (x = 0; x < paletteWidth; x++) {
            pixel = game.textures.getPixel(x, y, config.paletteKey);
            colorLookup[palette].push(pixel);
        }
    }

    console.log(colorLookup);

    // Create texture atlas from frame data.
    var animData = {};
    var atlasData;
    var atlasKey, animKey, canvasTexture, canvas;

    // Iterate over each palette.
    for (y = 0; y < config.paletteNames.length; y++) {
        palette = config.paletteNames[y];
        atlasKey = config.spriteSheet + '-' + palette;
        atlasData = { frames: [] };

        // Create a canvas to draw new image data onto.
        canvasTexture = game.textures.createCanvas();

        // Iterate over each animation.
        for (var a = 0; a < config.animations.length; a++) {
            animKey = atlasKey + '-' + config.animations[a];
            animData[animKey] = [];

            // Iterate frames for each animation.
            // NOTE: Length hard coded for now.
            for (var f = 0; f < 10; f++) {
                var frameName = config.animations[a] + (f ? f : '');
                var frame = game.textures.getFrame(config.spriteSheet, (a * 10) + f);

                // TODO: Copy frame into new canvas.
                // TODO: Replace RGB in new frame.

                // Add this to the texture atlas definitions.
                atlasData.frames.push({
                    filename: atlasKey + '-' + frameName,
                    frame: { x: frame.cutX, y: frame.cutY, w: frame.width, h: frame.height },
                    // NOTE: Do I *need* the following?
                    rotated: false,
                    trimmed: true,
                    spriteSourceSize: { x: frame.cutX, y: frame.cutY, w: frame.width, h: frame.height },
                    sourceSize: { w: frame.width, h: frame.height }
                });

                // Add this to the animation definitions.
                animData[animKey].push({
                    key: atlasKey,
                    frame: atlasKey + '-' + frameName,
                    // NOTE: Do I *need* the following?
                    duration: 0,
                    visible: false
                });
            }
        }

        // Add texture atlas to game.
        game.textures.addAtlasJSONArray(atlasKey, canvasTexture.getSourceImage(), atlasData);
    }

    // Now that the atlases for all the palettes have been made,
    // make each necessary animation.
    for (var key in animData) {
        game.anims.create({
            key: key,
            frames: animData[key],
            frameRate: 15,  // NOTE: Hard coded for now.
            repeat: -1
        });
    }
}
