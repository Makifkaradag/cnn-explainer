import type { KernelPresetId } from '@/data/kernels';
import type { ActivationName } from '@/types';

type LayerText = { op: string; explain: string };

export const en = {
  htmlLang: 'en',
  langName: 'English',

  nav: {
    explore: 'Explore',
    playground: 'Playground',
    training: 'Training',
    concepts: 'Under the hood',
    menu: 'Menu',
    github: 'Source code on GitHub',
    toLight: 'Switch to light mode',
    toDark: 'Switch to dark mode',
    language: 'Language',
  },

  footer: {
    tagline: 'CNN Explainer runs entirely in your browser.',
    note: 'Convolution, activation, pooling and softmax are real implementations. The network itself is a tiny educational model, not a production classifier.',
  },

  common: {
    loading: 'Loading…',
    reset: 'Reset',
    play: 'Play',
    pause: 'Pause',
    examples: 'Examples',
    draw: 'Draw',
    upload: 'Upload',
    input: 'Input',
    kernel: 'Kernel',
    kernelSize: 'Kernel size',
    stride: 'Stride',
    padding: 'Padding',
    activation: 'Activation',
    pooling: 'Pooling',
    max: 'Max',
    avg: 'Avg',
    average: 'Average',
    featureMap: 'Feature map',
    yourDrawing: 'Your drawing',
    parameters: (n: string) => `${n} parameters`,
    iteration: 'iteration',
  },

  playback: {
    prev: 'Previous position',
    next: 'Next position',
    finish: 'Compute everything',
    restart: 'Back to start',
    speed: 'Animation speed',
    speeds: ['Slow', 'Normal', 'Fast', 'Turbo'],
    step: (i: number, n: number) => `step ${i} / ${n}`,
  },

  tags: {
    computed: {
      label: 'Real computation',
      title: 'These numbers are produced by the actual math implemented in this app.',
    },
    simulated: {
      label: 'Simplified simulation',
      title: 'Real math on a deliberately tiny, simplified network, not a production CNN.',
    },
    illustrative: {
      label: 'Illustrative',
      title: 'A picture to build intuition. Not computed by a trained network.',
    },
  },

  classes: ['Circle', 'Square', 'Triangle', 'Cross'],

  examples: {
    circle: 'Circle',
    square: 'Square',
    triangle: 'Triangle',
    cross: 'Cross',
    seven: 'Digit 7',
    smiley: 'Smiley',
    stripes: 'Stripes',
  } as Record<string, string>,

  kernels: {
    edge: 'Edge detection',
    vertical: 'Vertical edge',
    horizontal: 'Horizontal edge',
    diagonal: 'Diagonal edge ↘',
    antiDiagonal: 'Diagonal edge ↗',
    sharpen: 'Sharpen',
    blur: 'Blur',
    texture: 'Texture (checker)',
    identity: 'Identity',
  } satisfies Record<KernelPresetId, string> as Record<KernelPresetId, string>,
  customKernel: 'Custom (edited)',

  activationFormulas: {
    relu: 'f(x) = max(0, x)',
    leakyRelu: 'f(x) = x if x > 0, else 0.1x',
    sigmoid: 'f(x) = 1 / (1 + e⁻ˣ)',
    tanh: 'f(x) = tanh(x)',
  } satisfies Record<ActivationName, string> as Record<ActivationName, string>,

  chapters: {
    input: {
      title: 'The input image',
      short: 'Pixels as numbers',
      lede: 'To a computer, a grayscale image is just a grid of numbers. Ours is 28×28 = 784 brightness values between 0 (black) and 1 (white).',
    },
    convolution: {
      title: 'Convolution',
      short: 'A kernel slides over the image',
      lede: 'A small grid of weights, the kernel, slides across the image. At each position it multiplies the pixels under it by its weights and adds everything up. That single number becomes one pixel of the output.',
    },
    'feature-maps': {
      title: 'Feature maps',
      short: 'Different filters, different patterns',
      lede: "The output of a convolution is called a feature map: bright where the kernel's pattern appears in the image. A layer uses many kernels at once, so it produces a stack of feature maps.",
    },
    relu: {
      title: 'ReLU activation',
      short: 'Keep the positives',
      lede: 'After convolution, an activation function is applied to every value. ReLU is the most common: negative values become 0, positive values pass through. This non-linearity is what lets stacked layers learn more than a single linear filter could.',
    },
    pooling: {
      title: 'Pooling',
      short: 'Shrink, keep the strongest',
      lede: 'Pooling shrinks a feature map by summarising small windows. Max pooling keeps the strongest response in each window, so the next layer works on fewer numbers and becomes less sensitive to small shifts.',
    },
    architecture: {
      title: 'A complete CNN',
      short: 'Layer by layer, shape by shape',
      lede: 'Real networks stack these operations. Here is the small CNN used throughout this app. Click any layer to see what goes in, what happens, and what comes out.',
    },
    hierarchy: {
      title: 'Feature hierarchy',
      short: 'From edges to objects',
      lede: 'Each layer builds on the one before it. Deeper neurons see a larger part of the image and can respond to more complex combinations of simpler features.',
    },
    dense: {
      title: 'Flatten & Dense',
      short: 'From maps to a vector to scores',
      lede: 'To make a decision, the final feature maps are unrolled into one long vector. A fully connected (Dense) layer then gives each class a score: a weighted sum of all the features.',
    },
    softmax: {
      title: 'Softmax prediction',
      short: 'Scores become probabilities',
      lede: 'The class scores (logits) can be any number. Softmax turns them into probabilities that are positive and sum to 1. Drag the sliders to see how it reacts.',
    },
    experiments: {
      title: 'What happens if…?',
      short: 'Change everything, watch it update',
      lede: 'Change the kernel, stride, padding, activation, pooling or the number of filters, and see the feature maps and tensor shapes update immediately.',
    },
  },

  home: {
    eyebrow: 'See inside a Convolutional Neural Network',
    subtitle:
      'An interactive visual journey through convolution, feature maps, pooling, and prediction.',
    start: 'Start Exploring',
    playground: 'CNN Playground',
    pipelineIntro: 'One image, ten steps, one prediction:',
    liveTag: 'Live output of a tiny CNN',
    tryAnother: 'Try another input →',
    chaptersTitle: 'Ten interactive chapters',
    chaptersSub: 'Each one turns a single idea into something you can poke at.',
    readFromStart: 'Read from the start →',
    pages: [
      {
        to: '/playground',
        title: 'CNN Playground',
        text: 'Pick an image and a kernel, then run the network one layer at a time, or let it auto-play.',
      },
      {
        to: '/training',
        title: 'Training',
        text: 'Watch forward pass, loss, backpropagation and weight updates repeat until the network learns.',
      },
      {
        to: '/concepts',
        title: 'Under the hood',
        text: 'The formulas behind convolution, pooling and softmax, plus a visual glossary of CNN terms.',
      },
    ],
    honestyTitle: 'What is real, and what is simplified?',
    honestySub: 'Every visual carries a label so you always know what you are looking at.',
    honestyReal:
      'Convolution, activations, pooling, flatten, dense layer and softmax are real implementations, computed live on your image.',
    honestySim:
      'The network is tiny: hand-picked first-layer filters, random second-layer filters, and a Dense layer trained in your browser on synthetic shapes. Real CNNs learn every filter from data.',
    stages: [
      'Input',
      'Conv',
      'ReLU',
      'Pool',
      'Conv',
      'ReLU',
      'Pool',
      'Flatten',
      'Dense',
      'Softmax',
    ],
  },

  explore: {
    eyebrow: 'Explore',
    title: 'Inside a Convolutional Neural Network',
    intro:
      'Follow one image through every stage of a small CNN. Every visual below is computed live from the image you choose. Change it and everything updates.',
    currentInput: 'Current input',
    change: 'change',
    chaptersNav: 'Chapters',
    ctaTitle: 'Run the whole pipeline yourself',
    ctaText: 'Step through every layer, or watch the network learn.',
    ctaPlayground: 'CNN Playground',
    ctaTraining: 'Training',
  },

  input: {
    chooseTitle: 'Choose an input',
    sourceLabel: 'Input source',
    seesTitle: 'What the network sees',
    original: 'Original upload',
    originalToGray: 'Original → grayscale',
    inverted: 'Inverted (light background detected)',
    grayscale: 'Grayscale pixels',
    gridLabel: 'Input image, 28 by 28 grayscale pixels',
    zoom: 'Zoom · 5×5 around pixel',
    hoverHint: 'Hover the image to read individual pixel values.',
    pixelHint: 'Each pixel is a single brightness value: 0 is black, 1 is white.',
    drop: 'Drop an image here, or',
    chooseFile: 'Choose a file',
    notImage: 'Please choose an image file (PNG, JPG, GIF, WebP…).',
    loadError: 'Could not read this file as an image.',
    privacy:
      'Your image never leaves the browser. It is centre-cropped, resized to 28×28 and converted to grayscale. Light backgrounds are inverted so the shape is bright on dark, like the training data.',
  },

  draw: {
    canvas: 'Drawing canvas',
    tool: 'Drawing tool',
    brush: 'Brush',
    eraser: 'Eraser',
    size: 'Brush size',
    sizes: ['Thin', 'Medium', 'Thick'],
    clear: 'Clear',
    hint: 'Draw a circle, square, triangle or cross. The tiny model only knows these four.',
  },

  kernelEditor: {
    weight: (r: number, c: number) => `Kernel weight row ${r} column ${c}`,
    bias: 'bias',
  },

  conv: {
    preset: 'Kernel preset',
    zeroPadding: (p: number) => `+ ${p}px zero padding`,
    inputLabel: 'Input image with the kernel window',
    clickHint: 'Click anywhere to move the kernel there.',
    weights: 'Kernel weights · editable',
    position: (i: number, j: number) => `Position (${i}, ${j}) · input × weight`,
    pad: 'pad',
    output: 'Output feature map',
    legend: 'negative · 0 · positive',
    outputSize: 'Output size:',
  },

  fmaps: {
    filter: (n: number) => `Filter ${n}`,
    finds: ['vertical edges', 'horizontal edges', 'diagonal edges', 'texture / corners'],
    looksFor: (what: string) => `looks for ${what}`,
    gallery: 'One input, four filters → four feature maps (click to inspect)',
    note: 'These four kernels are hand-picked textbook filters, chosen because their output is easy to read. A trained CNN does not start with them: its filter weights begin random and are learned through backpropagation. Early layers of trained networks often end up resembling edge and colour detectors, but many learned filters have no simple human description.',
  },

  relu: {
    from: 'Feature map from kernel',
    mostNeg: 'Most negative',
    mostPos: 'Most positive',
    keysLabel: 'Use arrow keys to move the highlighted pixel',
    before: 'Before ReLU',
    after: 'After ReLU',
    negative: 'negative → 0',
    positive: 'positive → unchanged',
    zero: 'zero stays zero',
    move: 'Move highlighted pixel',
    up: 'Up',
    down: 'Down',
    left: 'Left',
    right: 'Right',
    stats: (neg: number, total: number) =>
      `${neg} of ${total} values were negative and became 0. Hover, click or use the arrow keys to inspect any pixel.`,
  },

  pool: {
    type: 'Pooling type',
    maxPooling: 'Max pooling',
    avgPooling: 'Average pooling',
    window: 'Window',
    windowSize: 'Window size',
    input: 'Input feature map (after ReLU)',
    region: (s: number) => `Current ${s}×${s} region`,
    sum: (n: number) => `sum / ${n}`,
    output: 'Output (pooled)',
    values: (a: number, b: number) => `${a} → ${b} values`,
    fewer: (x: string) => `${x}× fewer numbers for the next layer`,
    maxNote:
      'Max pooling keeps only the strongest response in each window. It answers “was the pattern here?”, not exactly where.',
    avgNote: 'Average pooling keeps the mean response of each window, which smooths the map.',
    noWeights: 'It has no learnable weights.',
  },

  arch: {
    hint: 'Click a layer to inspect it · shapes are height × width × channels',
    total: (n: string) => `${n} learnable parameters in total`,
    enters: 'What enters',
    does: 'What the layer does',
    comesOut: 'What comes out',
    rawImage: 'The raw image. Nothing comes before it.',
    notLearned: 'Weights not learned',
    trainedHere: 'Trained in your browser',
    layers: {
      input: {
        op: 'Grayscale image',
        explain:
          'A 28×28 grid of brightness values in [0, 1]. One channel because the image is grayscale; a colour image would have 3.',
      },
      conv1: {
        op: '8 filters · 3×3 · stride 1 · no padding',
        explain:
          'Each of the 8 filters slides over the image and produces its own feature map. Without padding, a 3×3 window fits 26 times across 28 pixels.',
      },
      act1: {
        op: 'max(0, x) element-wise',
        explain:
          'Applied to every value independently, so the shape is unchanged. Negative responses are clipped to 0.',
      },
      pool1: {
        op: '2×2 window · stride 2',
        explain:
          'Keeps the strongest response in each 2×2 block, halving width and height. Each channel is pooled separately.',
      },
      conv2: {
        op: '16 filters · 3×3×8 · stride 1',
        explain:
          'Every filter now spans all 8 input channels (3×3×8 weights), so it can combine edges into more complex patterns.',
      },
      act2: {
        op: 'max(0, x) element-wise',
        explain:
          'Same non-linearity as before. Without it, stacked convolutions would collapse into a single linear operation.',
      },
      pool2: {
        op: '2×2 window · stride 2',
        explain:
          '11 is odd, so the last row and column do not fit a full window and are dropped: ⌊(11 − 2) / 2⌋ + 1 = 5.',
      },
      flat: {
        op: 'Reshape to a vector',
        explain:
          'No computation. The 16 maps of 5×5 are laid out end to end as a list of 400 numbers.',
      },
      logits: {
        op: '4 neurons, fully connected',
        explain:
          'Each output neuron computes a weighted sum of all 400 inputs plus a bias. The results are called logits.',
      },
      probs: {
        op: 'exp(zᵢ) / Σ exp(zⱼ)',
        explain: 'Turns the logits into probabilities that are positive and sum to 1.',
      },
    } as Record<string, LayerText>,
  },

  hierarchy: {
    rf: 'Receptive field',
    rfText: (layer: string, note: string) =>
      `The highlighted area is how much of the input one neuron in ${layer} can “see”: ${note}. Stacking convolutions and pooling makes it grow.`,
    levels: [
      { title: 'Layer 1', subtitle: 'Edges', rfNote: '3×3 pixels', tag: 'Computed by this app' },
      {
        title: 'Layer 2',
        subtitle: 'Textures / simple shapes',
        rfNote: '8×8 pixels',
        tag: 'Computed (random filters)',
      },
      {
        title: 'Layer 3',
        subtitle: 'Parts / patterns',
        rfNote: 'about 18×18 in a deeper net',
        tag: 'Illustrative',
      },
      {
        title: 'Layer 4',
        subtitle: 'Higher-level structures',
        rfNote: 'the whole image',
        tag: 'Illustrative',
      },
    ],
    edgeNames: ['vertical', 'horizontal', 'diagonal', 'outline'],
    channel: (n: number) => `channel ${n}`,
    parts: ['corner', 'curve', 'junction', 'line end', 'parallel', 'ring'],
    wholes: ['round object', 'box-like', 'pointed', 'face-like'],
    note: "This is an intuitive picture of hierarchical feature learning, not a guarantee. Layers 1–2 are real outputs of this app's tiny network; layers 3–4 are drawings. Studies of trained CNNs often find a similar progression from simple to complex features, but what each layer learns depends on the data, the architecture and the training.",
  },

  flatten: {
    firstMaps: 'First 3 of 16 pooled feature maps',
    vectorFirst: 'Vector (first 3 maps)',
    flatten: 'Flatten',
    unflatten: 'Un-flatten',
    map: (n: number) => `map ${n}`,
    allMaps: 'All 16 maps',
    vector: 'Flattened vector',
    note: 'Row c holds map c, read left to right, top to bottom. Flatten does no math: it only changes the shape from 5×5×16 to 400 so a Dense layer can use it.',
    wrapped: (n: number) => `${n} numbers, wrapped 25 per row (one row = one 5×5 map)`,
  },

  dense: {
    aria: 'Dense layer connections',
    more: '⋮ 388 more inputs',
    legendPos: 'positive weight',
    legendNeg: 'negative weight',
    thickness: 'thickness = |w|',
    showing: 'Showing the 12 most active of 400 inputs (48 of 1,600 weights).',
    adds: (cls: string) => `How the ${cls} logit adds up (all 400 inputs)`,
    bias: 'bias',
    others: '395 other terms',
    feeds: (i: number, v: string) => `Input x${i} = ${v} feeds every neuron`,
    hint: 'Hover a neuron or an input. Every output neuron is connected to all 400 inputs; that is what “fully connected” means. These weights were trained in your browser on synthetic shapes.',
  },

  softmax: {
    edited: 'Logits edited by you',
    fromModel: 'Logits from the tiny model',
    useNetwork: 'Use network logits',
    equal: 'All equal',
    cls: 'Class',
    logit: 'Logit z',
    prob: 'Probability',
    sliderLabel: (cls: string) => `${cls} logit`,
    points: [
      'Every probability is positive and they always sum to 1.',
      'Only differences between logits matter: adding the same number to all of them changes nothing.',
      'The exponential exaggerates gaps, so the largest logit tends to dominate.',
    ],
    note: "The starting logits come from this app's tiny model (4 classes, trained on synthetic shapes). They are a simulation, not a real-world classifier's output.",
  },

  exp: {
    firstKernel: 'First kernel',
    poolSize: 'Pool size',
    filters: 'Number of filters',
    convOut: 'conv output',
    params: 'parameters',
    filter: 'Filter',
    tooSmall: 'Too small to pool',
    tip: 'Try stride 2 and the output shrinks by half. Padding 1 with a 3×3 kernel keeps the size. Sigmoid removes negatives and pushes everything towards 0.5. Compare average and max pooling. Everything is recomputed live from the current input image.',
  },

  playground: {
    eyebrow: 'Playground',
    title: 'CNN Playground',
    intro:
      'Configure the first layer, then push your image through the network one stage at a time.',
    imageCard: '1 · Image',
    settingsCard: '2 · Layer settings',
    kernelFor1: 'Kernel for filter #1',
    run: 'Run step-by-step',
    auto: 'Auto play',
    stage: (i: number, n: number) => `stage ${i} / ${n}`,
    from: (shape: string) => `from ${shape}`,
    yourFilter: 'your filter',
    predicted: 'Predicted:',
    changedNote:
      'You changed the first layer. The Dense layer was trained on features from the default settings (vertical edge kernel, ReLU, max pooling), so it now sees inputs it was never trained on and the prediction may get worse. A real network would be retrained after a change like this.',
    tinyNote: (n: number) =>
      `This prediction comes from a tiny simulated CNN that only knows ${n} synthetic shape classes. Anything else, like a smiley, is still forced into one of them.`,
    stages: (act: string, pool: string) => [
      { title: 'Input', explain: 'The grayscale image: 784 numbers between 0 and 1.' },
      {
        title: 'Convolution',
        explain:
          'Eight 3×3 filters slide over the image. Filter #1 is the kernel you picked; the other seven are fixed edge filters.',
      },
      {
        title: act,
        explain: `${act} is applied to every value of every feature map. The shape does not change.`,
      },
      {
        title: `${pool} pool`,
        explain: 'Each 2×2 block is reduced to one value, halving width and height.',
      },
      {
        title: 'Convolution 2',
        explain:
          'Sixteen filters, each spanning all 8 input maps (3×3×8 weights), combine the first-layer features.',
      },
      { title: `${act} 2`, explain: 'The same activation again, element-wise.' },
      {
        title: `${pool} pool 2`,
        explain:
          '11×11 → 5×5. The last row and column do not fill a complete window and are dropped.',
      },
      {
        title: 'Flatten',
        explain: 'The 16 maps of 5×5 are unrolled into a single vector of 400 numbers.',
      },
      {
        title: 'Dense',
        explain:
          'Four neurons, one per class. Each is a weighted sum of all 400 inputs plus a bias: the logits.',
      },
      {
        title: 'Prediction',
        explain: 'Softmax turns the logits into probabilities that sum to 1.',
      },
    ],
  },

  training: {
    eyebrow: 'Training',
    title: 'How a CNN learns',
    intro:
      'Nobody writes the weights of a CNN by hand. Training repeats one loop thousands of times: predict, measure the error, work out how each weight contributed to it, and nudge every weight a little in the direction that reduces it.',
    train: 'Train',
    oneStep: 'One step',
    speed: 'Speed',
    speeds: ['Explain', 'Normal', 'Fast'],
    lr: 'Learning rate',
    batch: 'Batch size',
    phases: [
      { name: 'Forward pass', detail: 'Run the batch through the network' },
      { name: 'Prediction', detail: 'Softmax gives class probabilities' },
      { name: 'Loss', detail: 'Cross-entropy: −log p(correct class)' },
      { name: 'Backpropagation', detail: '∂loss/∂w for every weight (here: p − y times x)' },
      { name: 'Weight update', detail: 'w ← w − learning rate × gradient' },
    ],
    next: '↺ next iteration',
    epoch: 'Epoch',
    iteration: 'Iteration',
    loss: 'Loss',
    accuracy: 'Accuracy',
    validation: 'Validation',
    trainImages: (n: number) => `${n} training images`,
    batchOf: (n: number) => `batch of ${n}`,
    thisBatch: 'this batch',
    unseen: (n: number) => `${n} unseen images`,
    lower: 'lower is better',
    higher: 'higher is better',
    lossAria: 'Loss over iterations',
    accAria: 'Accuracy over iterations',
    batchSeries: 'batch',
    valSeries: 'validation',
    example: 'One example from the batch',
    trueLabel: 'true label:',
    weightsTitle: 'Dense-layer weights, reshaped as 16 maps of 5×5',
    cls: 'Class',
    show: 'Show',
    weights: 'Weights',
    gradient: 'Last gradient',
    ch: (n: number) => `ch ${n}`,
    weightsNote: (cls: string) =>
      `Each weight connects one flattened feature to the ${cls} neuron. Orange weights push the score up when that feature is active, blue ones push it down. Watch them sharpen as training goes on.`,
    gradientNote: 'The gradient shows the direction each weight is about to move (opposite sign).',
    individual: 'Individual weights',
    individualNote: 'Value and the change (Δ) from the most recent update.',
    realTag: 'Real gradient descent',
    simTag: 'Simplified setup',
    realNote: (n: number) =>
      `The numbers above come from actual mini-batch gradient descent on softmax cross-entropy. Nothing is faked. But only the final Dense layer (1,604 parameters) is trained, on ${n} synthetic drawings, and the convolutional filters stay frozen to keep it fast.`,
    realCnnNote:
      'In a real CNN, backpropagation keeps going: the chain rule carries the gradient back through the Dense layer, pooling, ReLU and every convolution, so all filter weights are learned from data. That usually takes many epochs over thousands of images, often on a GPU. Try learning rate 8 to see an unstable, jumpy loss.',
  },

  concepts: {
    eyebrow: 'Under the hood',
    title: 'The math, briefly',
    intro:
      'Four formulas carry most of a CNN. Expand each one for a worked example. The numbers are computed by the same code that runs the visualisations.',
    convTitle: 'Convolution',
    convText:
      'Place the kernel K at position (i, j), multiply each pixel by the weight on top of it and sum. Deep learning libraries, and this app, do not flip the kernel, so strictly speaking this is cross-correlation. Since the weights are learned, the difference does not matter in practice.',
    patch: 'image patch',
    verticalKernel: 'vertical-edge kernel',
    outputSize: (formula: string) => `Output size per axis: ${formula}`,
    outputSizeVars: 'for input size n, padding p, kernel size k and stride s.',
    reluText:
      'Applied independently to every value. It is cheap to compute and its gradient is simply 1 for positive inputs and 0 otherwise, which helps deep networks train. The other activations in this app are sigmoid 1/(1+e⁻ˣ), tanh and leaky ReLU (0.1x for negatives).',
    poolTitle: 'Pooling',
    window: 'window',
    poolText:
      'No weights: pooling is a fixed summary of each window. A 2×2 window with stride 2 halves width and height and keeps the channel count. It gives a little robustness to small shifts of the input.',
    softmaxText:
      'In practice max(z) is subtracted from every logit first. It cancels out in the fraction but stops exp() from overflowing. Training minimises the cross-entropy loss −log p of the correct class.',
    sum: 'sum',
    glossary: 'Glossary',
    glossarySub: 'The vocabulary you will meet in every CNN paper and tutorial.',
    terms: {
      rf: {
        term: 'Receptive field',
        text: 'The region of the input image that can influence one neuron. It grows with every conv and pooling layer.',
      },
      stride: {
        term: 'Stride',
        text: 'How many pixels the kernel moves between positions. Stride 2 roughly halves the output size.',
      },
      padding: {
        term: 'Padding',
        text: 'Zeros added around the border so the kernel can also be centred on edge pixels. Padding 1 with a 3×3 kernel keeps the size.',
      },
      channels: {
        term: 'Channels',
        text: 'The depth of a tensor. A colour image has 3 (R, G, B); a conv layer with 8 filters outputs 8.',
      },
      fmap: {
        term: 'Feature map',
        text: 'The output of one filter: a grid showing where, and how strongly, the filter’s pattern occurs.',
      },
      params: {
        term: 'Parameters',
        text: 'Numbers the network learns. A conv layer has (k·k·C_in + 1)·C_out of them, which is 80 for 8 filters of 3×3 on a grayscale image.',
      },
      weights: {
        term: 'Weights',
        text: 'The values inside kernels and dense layers. Training adjusts them to reduce the loss.',
      },
      bias: {
        term: 'Bias',
        text: 'One extra learnable number per filter or neuron, added after the weighted sum. It shifts the point where the neuron “fires”.',
      },
      activation: {
        term: 'Activation',
        text: 'A non-linear function applied element-wise (ReLU, sigmoid, tanh…). Without it, stacked layers collapse into one linear map.',
      },
      logits: {
        term: 'Logits',
        text: 'The raw class scores from the last Dense layer, before softmax. They can be any real number.',
      },
    },
    actTitle: 'Activation functions',
    actSub: 'Each plotted for x from −3 to 3.',
    limitsTitle: 'Educational limitations',
    limits: [
      'The demo network is tiny (about 2.9k parameters) and works on 28×28 grayscale images with 4 classes.',
      'First-layer filters are hand-picked and second-layer filters are random; only the Dense layer is trained.',
      'Real CNNs learn all filters, use many more layers and channels, and add techniques such as batch normalisation.',
      'Hierarchy and “what a layer detects” pictures are intuitions, not guarantees about any particular trained model.',
    ],
  },

  notFound: {
    title: 'This layer does not exist.',
    back: 'Back to the start',
  },
};

export type Dictionary = typeof en;
