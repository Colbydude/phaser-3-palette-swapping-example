var config = {
    type: Phaser.AUTO,
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
        spriteSheet: {                                      // Spritesheet we're manipulating.
            key: 'link',
            frameWidth: 32,                                 // NOTE: Potential drawback. All frames are the same size.
            frameHeight: 32
        },
        animations: [                                       // Animation data.
            {key: 'walk-down', frameRate: 15, startFrame: 0, endFrame: 9},
            {key: 'walk-left', frameRate: 15, startFrame: 10, endFrame: 19},
            {key: 'walk-up', frameRate: 15, startFrame: 20, endFrame: 29}
        ]
    };

    // Create the dynamic spritesheets and animations.
    createPalettes(animConfig);

    // -- DEMO -- \\
    // Add text.
    this.add.text(5, 5, "WASD: Change Animation");
    this.add.text(5, 20, "X: Change Palette");

    // Add sprite.
    var link = this.add.sprite(120, 80, 'link-' + animConfig.paletteNames[0]).setScale(2);

    // Set color and animation.
    link.color = animConfig.paletteNames[0];
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
        var index = animConfig.paletteNames.indexOf(link.color);

        index++;

        if (index >= animConfig.paletteNames.length) {
            index = 0;
        }

        link.color = animConfig.paletteNames[index];

        link.anims.play('link-' + link.color + '-walk-down');
    });
}

/**
 * Creates new sprite sheets and animations from the given palette and spritesheet.
 *
 * @param {object} config - Config schema.
 */
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

    // Create sheets and animations from base sheet.
    var sheet = game.textures.get(config.spriteSheet.key).getSourceImage();
    var atlasKey, anim, animKey;
    var canvasTexture, canvas, context, imageData, pixelArray;

    // Iterate over each palette.
    for (y = 0; y < config.paletteNames.length; y++) {
        palette = config.paletteNames[y];
        atlasKey = config.spriteSheet.key + '-' + palette;

        // Create a canvas to draw new image data onto.
        canvasTexture = game.textures.createCanvas(config.spriteSheet.key + '-temp', sheet.width, sheet.height);
        canvas = canvasTexture.getSourceImage();
        context = canvas.getContext('2d');

        // Copy the sheet.
        context.drawImage(sheet, 0, 0);

        // Get image data from the new sheet.
        imageData = context.getImageData(0, 0, sheet.width, sheet.height);
        pixelArray = imageData.data;

        // Iterate through every pixel in the image.
        for (var p = 0; p < pixelArray.length / 4; p++) {
            var index = 4 * p;

            var r = pixelArray[index];
            var g = pixelArray[++index];
            var b = pixelArray[++index];
            var alpha = pixelArray[++index];

            // If this is a transparent pixel, ignore, move on.
            if (alpha === 0) {
                continue;
            }

            // Iterate through the colors in the palette.
            for (var c = 0; c < paletteWidth; c++) {
                var oldColor = colorLookup[config.paletteNames[0]][c];
                var newColor = colorLookup[palette][c];

                // If the color matches, replace the color.
                if (r === oldColor.r && g === oldColor.g && b === oldColor.b && alpha === 255) {
                    pixelArray[--index] = newColor.b;
                    pixelArray[--index] = newColor.g;
                    pixelArray[--index] = newColor.r;
                }
            }
        }

        // Put our modified pixel data back into the context.
        context.putImageData(imageData, 0, 0);

        // Add the canvas as a sprite sheet to the game.
        game.textures.addSpriteSheet(atlasKey, canvasTexture.getSourceImage(), {
            frameWidth: config.spriteSheet.frameWidth,
            frameHeight: config.spriteSheet.frameHeight,
        });

        // Iterate over each animation.
        for (var a = 0; a < config.animations.length; a++) {
            anim = config.animations[a];
            animKey = atlasKey + '-' + anim.key;

            // Add the animation to the game.
            game.anims.create({
                key: animKey,
                frames: game.anims.generateFrameNumbers(atlasKey, {start: anim.startFrame, end: anim.endFrame}),
                frameRate: anim.frameRate,
                repeat: anim.repeat === undefined ? -1 : anim.repeat
            });
        }

        // Destroy temp texture.
        game.textures.get(config.spriteSheet.key + '-temp').destroy();
    }

    // Destroy textures that are not longer needed.
    // NOTE: This doesn't remove the textures from TextureManager.list.
    //       However, it does destroy source image data.
    game.textures.get(config.spriteSheet.key).destroy();
    game.textures.get(config.paletteKey).destroy();
}
