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
        paletteNames: ['green', 'red', 'blue', 'purple'],   // Names for each palette to build out the names for the atlas.
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
    var link = this.add.sprite(120, 80, 'link').setScale(2);

    // Set color and animation.
    link.color = animConfig.paletteNames[0];
    link.anims.play('link-' + link.color + '-' + animConfig.animations[0]);

    // Handle Input.
    this.input.keyboard.on('keydown_W', function (event) {
        link.flipX = false;
        link.anims.play('link-' + link.color + '-' + animConfig.animations[2]);
    });

    this.input.keyboard.on('keydown_A', function (event) {
        link.flipX = false;
        link.anims.play('link-' + link.color + '-' + animConfig.animations[1]);
    });

    this.input.keyboard.on('keydown_S', function (event) {
        link.flipX = false;
        link.anims.play('link-' + link.color + '-' + animConfig.animations[0]);
    });

    this.input.keyboard.on('keydown_D', function (event) {
        link.flipX = true;
        link.anims.play('link-' + link.color + '-' + animConfig.animations[1]);
    });

    this.input.keyboard.on('keydown_X', function (event) {
        var index = animConfig.paletteNames.indexOf(link.color);

        index++;

        if (index >= animConfig.paletteNames.length) {
            index = 0;
        }

        link.color = animConfig.paletteNames[index];

        link.anims.play('link-' + link.color + '-' + animConfig.animations[0]);
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
    var sheet = game.textures.get(config.spriteSheet).getSourceImage();
    var atlasKey, animKey;
    var canvasTexture, canvas, context;

    // Iterate over each palette.
    for (y = 0; y < config.paletteNames.length; y++) {
        palette = config.paletteNames[y];
        atlasKey = config.spriteSheet + '-' + palette;
        atlasData = { frames: [] };

        // Create a canvas to draw new image data onto.
        canvasTexture = game.textures.createCanvas(config.spriteSheet + '-temp', sheet.width, sheet.height);
        canvas = canvasTexture.getSourceImage();
        context = canvas.getContext('2d');

        // Copy the sheet.
        context.drawImage(sheet, 0, 0, sheet.width, sheet.height);

        // TODO: Replace pixels throughout sheet.

        // Add the canvas as a sprite sheet to the game.
        game.textures.addSpriteSheet(atlasKey, canvasTexture.getSourceImage(), {
            frameWidth: 32,
            frameHeight: 32,
            startFrame: 0,
            endFrame: 29
        });

        // Iterate over each animation.
        for (var a = 0; a < config.animations.length; a++) {
            animKey = atlasKey + '-' + config.animations[a];

            // Add the animation to the game.
            game.anims.create({
                key: animKey,
                frames: game.anims.generateFrameNumbers('link', {start: 0 + (a * 10), end: 9 + (a * 10)}),
                frameRate: 15,  // NOTE: Hard coded for now.
                repeat: -1
            });
        }
    }
}
