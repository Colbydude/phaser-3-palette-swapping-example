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
        paletteKey: 'link-palette',
        paletteNames: ['green', 'red', 'blue', 'purple'],
        spriteSheet: 'link',
        animations: ['walk-down', 'walk-left', 'walk-up']
    };

    // NOTE: WIP.
    createPalettes(animConfig);

    // Make test animations.
    // TODO: Replace with animations created from createPalettes.
    for (var i = 0; i < animConfig.animations.length; i++) {
        this.anims.create({
            key: 'link-green-' + animConfig.animations[i],
            frames: this.anims.generateFrameNumbers('link', {start: 0 + (i * 10), end: 9 + (i * 10)}),
            frameRate: 15,
            repeat: -1
        });
    }

    // Add text.
    this.add.text(5, 5, "WASD: Change Animation");
    this.add.text(5, 20, "X: Change Palette");

    // Add sprite.
    var link = this.add.sprite(120, 80, 'link');
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

    for (y = 0; y < config.paletteNames.length; y++) {
        palette = config.paletteNames[y];
        colorLookup[palette] = [];

        for (x = 0; x < paletteWidth; x++) {
            pixel = game.textures.getPixel(x, y, config.paletteKey);
            colorLookup[palette].push(pixel);
        }
    }

    console.log(colorLookup);

    // Create frame data.
    var atlasData = { frames: {} };

    for (y = 0; y < config.paletteNames.length; y++) {
        palette = config.paletteNames[y];

        // Iterate animations.
        for (var a = 0; a < config.animations.length; a++) {
            // Iterate frames for each animation.
            // TODO:
            for (var f = 0; f < 10; f++) {
                var frameName = config.animations[a] + (f ? f : '');
                var frame = game.textures.getFrame(config.spriteSheet, (a * 10) + f);

                // TODO: Replace RGB data.

                // Add this to the texture atlas definition.
                atlasData.frames[config.spriteSheet + '-' + palette + '-' + frameName] = { frame: { x: frame.cutX, y: frame.cutY, w: frame.width, h: frame.height } };
            }
        }
    }

    console.log(atlasData);
}
