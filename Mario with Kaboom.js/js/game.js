kaboom({
    global: true,
    fullscreen: true,
    scale: 1,
    debug: true,
    clearColor: [0, 0, 0, 1]
})

const MOVE_SPEED = 120
const JUMP_FORCE = 400
const BIG_JUMP_FORCE = 500
let CURRENT_JUMP_FORCE = JUMP_FORCE
let isJumping = true
const FALL_DEATH = 600

loadRoot('https://i.imgur.com/')
loadSprite('coin', 'wbKxhcd.png')
loadSprite('evil-shroom', 'KPO3fR9.png')
loadSprite('brick', 'pogC9x5.png')
loadSprite('block', 'M6rwarW.png')
loadSprite('mario', 'Wb1qfhK.png')
loadSprite('mushroom', '0wMd92p.png')
loadSprite('surprise', 'gesQ1KP.png')
loadSprite('unboxed', 'bdrLpi6.png')
loadSprite('pipe-top-left', 'ReTPiWY.png')
loadSprite('pipe-top-right', 'hj2GK4n.png')
loadSprite('pipe-bottom-left', 'c1cYSbt.png')
loadSprite('pipe-bottom-right', 'nqQ79eI.png')
//loadRoot('///home/tiago/Documentos/Estudos/Projetos Pessoais/Mario with Kaboom.js/')
//loadSound('tema_fase1', '../sounds/tema_fase1.mp3')
loadSprite('blue-block', 'fVscIbn.png')
loadSprite('blue-brick', '3e5YRQd.png')
loadSprite('blue-steel', 'gqVoI2b.png')
loadSprite('blue-evil-shroom', 'SvV4ueD.png')
loadSprite('blue-surprise', 'RMqCc16.png')

scene("game", ({ level, score }) => {
    layers(['bg', 'obj', 'ui'], 'obj')

    const maps = [
        [
            '                                                                                ',
            '                                                                                ',
            '                                                                                ',
            '                                                                                ',
            '                                                                                ',
            '                                                                                ',
            '                                                                                ',
            '                                                                                ',
            '                                                                                ',
            '                                                                                ',
            '                                                                                ',
            '                                                                                ',
            '                                                                                ',
            '                                                                                ',
            '                                                                                ',
            '                                                                                ',
            '         %  =*=%=                                                               ',
            '                                                                                ',
            '                                             _+                                 ',
            '                               ^  ^          ()                                 ',
            '===============================================   =============================='
        ],

        [
            '-                                                                              -',
            '-                                                                              -',
            '-                                                                              -',
            '-                                                                              -',
            '-                                                                              -',
            '-                                                                              -',
            '-                                                                              -',
            '-                                                                              -',
            '-                                                                              -',
            '-                                                                              -',
            '-                                                                              -',
            '-                                                                              -',
            '-            %%%%%%                                xxx                         -',
            '-                                                  xxx                         -',
            '-                                                 xxxx x                     _+-',
            '-                                   z      z    x xxxx x                     ()-',
            '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!'
        ]
    ]

    const levelCfg = {
        width: 20,
        height: 20,
        '=': [sprite('block'), solid()],
        '$': [sprite('coin'), 'coin'],
        '%': [sprite('surprise'), solid(), 'coin-surprise'],
        '*': [sprite('surprise'), solid(), 'mushroom-surprise'],
        '}': [sprite('unboxed'), solid()],
        '(': [sprite('pipe-bottom-left'), solid(), scale(0.5)],
        ')': [sprite('pipe-bottom-right'), solid(), scale(0.5)],
        '_': [sprite('pipe-top-left'), solid(), scale(0.5), 'pipe'],
        '+': [sprite('pipe-top-right'), solid(), scale(0.5), 'pipe'],
        '^': [sprite('evil-shroom'), solid(), 'dangerous', body()],
        '#': [sprite('mushroom'), 'mushroom', body()],
        '!': [sprite('blue-block'), solid(), scale(0.5)],
        '-': [sprite('blue-brick'), solid(), scale(0.5)],
        'z': [sprite('blue-evil-shroom'), solid(), scale(0.5), 'dangerous'],
        '@': [sprite('blue-surprise'), solid(), scale(0.5), 'coin-surprise'],
        'x': [sprite('blue-steel'), solid(), scale(0.5)]
    }

    const gameLevel = addLevel(maps[level], levelCfg)

    add([text('SEUS PONTOS', 20), pos(30, 60), layer('ui')])

    const scoreLabel = add([
        text(score, 20),
        pos(120, 90),
        layer('ui'),
        {
            value: score,
        }
    ])

    add([text('FASE ' + parseInt(level + 1), 20), pos(990, 60)])

    function big() {
        let timer = 0
        let isBig = false
        return {
            update() {
                if (isBig) {
                    timer -= dt()
                    if (timer <= 0) {
                        this.smallify()
                    }
                }
            },
            isBig() {
                return isBig
            },
            smallify() {
                this.scale = vec2(1)
                CURRENT_JUMP_FORCE = JUMP_FORCE
                timer = 0
                isBig = false
            },
            biggify(time) {
                this.scale = vec2(2)
                CURRENT_JUMP_FORCE = BIG_JUMP_FORCE
                timer = time
                isBig = true
            }
        }
    }

    const player = add([
        sprite('mario'), solid(),
        pos(30, 0),
        body(),
        big(),
        origin('bot')
    ])

    action('mushroom', (m) => {
        m.move(50, 0)
    })

    player.on("headbump", (obj) => {
        if ((obj.is('coin-surprise'))) {
            gameLevel.spawn('$', obj.gridPos.sub(0, 1))
            destroy(obj)
            gameLevel.spawn('}', obj.gridPos.sub(0, 0))
        }
        if ((obj.is('mushroom-surprise'))) {
            gameLevel.spawn('#', obj.gridPos.sub(0, 1))
            destroy(obj)
            gameLevel.spawn('}', obj.gridPos.sub(0, 0))
        }
    })

    player.collides('mushroom', (m) => {
        destroy(m)
        player.biggify(6)
    })

    player.action(() => {
        camPos(player.pos)
        if (player.pos.y >= FALL_DEATH) {
            go('lose', { score: scoreLabel.value })
        }
    })

    player.collides('coin', (c) => {
        destroy(c)
        scoreLabel.value++
        scoreLabel.text = scoreLabel.value
    })

    const ENEMY_SPEED = -40

    action('dangerous', (d) => {
        d.move(ENEMY_SPEED, 0)
    })

    player.collides('dangerous', (d) => {
        if (isJumping) {
            destroy(d)
        } else {
            go('lose', { score: scoreLabel.value })
        }
    })

    player.collides('pipe', () => {
        keyPress('down', () => {
            go('game', {
                level: (level + 1) % maps.length,
                score: scoreLabel.value
            })
        })
    })

    keyDown('left', () => {
        player.move(-MOVE_SPEED, 0)
    })

    keyDown('right', () => {
        player.move(+MOVE_SPEED, 0)
    })

    player.action(() => {
        if (player.grounded()) {
            isJumping = false
        }
    })

    keyDown('space', () => {
        if (player.grounded()) {
            isJumping = true
            player.jump(CURRENT_JUMP_FORCE)
        }
    })

    keyDown('up', () => {
        if (player.grounded()) {
            isJumping = true
            player.jump(CURRENT_JUMP_FORCE)
        }
    })
})

scene('lose', ({ score }) => {
    add([text('Se Fodeu', 32), origin('center'), pos(width() / 2, height() / 2.4)])
    add([text('Seus Pontos: ' + score, 32), origin('center'), pos(width() / 2, height() / 2)])
})

start("game", { level: 0, score: 0 })