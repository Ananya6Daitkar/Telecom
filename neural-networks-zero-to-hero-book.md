# Neural Networks: Zero to Hero

An original beginner-to-advanced learning book based on Andrej Karpathy's **Neural Networks: Zero to Hero** course.

This book is not a transcript. It is a structured technical companion meant to help you understand the lectures deeply enough to implement the code from scratch without rewatching the videos.

## How To Study This Book

1. Read the chapter once without coding.
2. Re-read the code walkthrough and type every line yourself.
3. Close the book and reimplement the project from memory.
4. Compare your version against the commented reference.
5. Use the revision sheets and flashcards before interviews.

## Course Map

| Chapter | Lecture | Core Build |
|---:|---|---|
| 1 | The spelled-out intro to neural networks and backpropagation | `micrograd` autograd engine |
| 2 | Makemore part 1 | Bigram character language model |
| 3 | Makemore part 2 | MLP character language model |
| 4 | Makemore part 3 | Activations, gradients, initialization, BatchNorm |
| 5 | Makemore part 4 | Manual backpropagation |
| 6 | Makemore part 5 | WaveNet-style hierarchical model |
| 7 | Let's build GPT | Decoder-only Transformer |
| 8 | Let's build the GPT Tokenizer | Byte Pair Encoding tokenizer |

---

# Part I: Foundations

## Chapter 1: Micrograd - Backpropagation From Scratch

### Chapter Overview

**What this video teaches:** how a neural network learns by computing derivatives through a computation graph. The implementation target is a tiny scalar-valued automatic differentiation engine called `micrograd`.

**Why it matters:** every large neural network, including GPT-style models, is trained by the same core idea: compute a loss, compute gradients of that loss with respect to parameters, and nudge parameters in the direction that reduces the loss.

**Prerequisites:** basic Python classes, arithmetic, functions, and the idea of a derivative as a slope.

### Concept Explanations

#### Derivative

**What it is:** the derivative tells you how much a function output changes when you slightly change its input.

**Why it exists:** learning needs direction. If increasing a weight increases loss, we should decrease that weight. If increasing it decreases loss, we should increase it.

**Intuition:** derivative is local sensitivity.

**Analogy:** if loss is your altitude on a mountain, the derivative tells whether a small step forward goes uphill or downhill.

**Visual explanation:**

```text
y
^
|          /
|        /
|      /
|____/____________> x
     tangent slope = derivative at this point
```

**Mathematical explanation:**

For a function `f(x)`, the derivative is

```text
df/dx = lim_{h -> 0} [f(x + h) - f(x)] / h
```

Example:

```text
f(x) = x^2
f(x+h) = (x+h)^2 = x^2 + 2xh + h^2
[f(x+h)-f(x)]/h = (2xh+h^2)/h = 2x + h
lim h->0 = 2x
```

So:

```text
d(x^2)/dx = 2x
```

**Common beginner confusion:** the derivative is not the final change over a large distance. It is the instantaneous local change.

#### Computational Graph

**What it is:** a graph where nodes are values and operations connect them.

**Why it exists:** complex functions are made of small operations. Backpropagation works by moving backward through these small operations.

**Intuition:** remember how every value was produced so you can later compute how it affected the final loss.

**Analogy:** a recipe. If the cake tastes too salty, trace backward through the recipe to the salt amount.

**Visual explanation:**

```text
a ----\
      (*) ---- c ----\
b ----/              (+) ---- d
e -------------------/
```

If `c = a*b` and `d = c+e`, then `d` depends on `a`, `b`, and `e`.

#### Chain Rule

**What it is:** a rule for derivatives of nested functions.

If:

```text
z = f(y)
y = g(x)
```

then:

```text
dz/dx = dz/dy * dy/dx
```

**Why it exists:** neural networks are deeply nested functions.

**Intuition:** if `x` affects `y`, and `y` affects `z`, then `x` affects `z` through the product of those effects.

**Common beginner confusion:** gradients accumulate. If one value contributes to the output through multiple paths, add all contributions.

#### Backpropagation

**What it is:** an efficient algorithm for applying the chain rule from output back to inputs.

**Why it exists:** neural networks can contain millions or billions of parameters. We need a systematic way to compute all gradients.

**Mental model:** each operation knows how to distribute the output gradient to its inputs.

For addition:

```text
z = x + y
dz/dx = 1
dz/dy = 1
```

So if `dL/dz = g`:

```text
dL/dx += g
dL/dy += g
```

For multiplication:

```text
z = x*y
dz/dx = y
dz/dy = x
```

So:

```text
dL/dx += g*y
dL/dy += g*x
```

For tanh:

```text
z = tanh(x)
dz/dx = 1 - tanh(x)^2
```

So:

```text
dL/dx += g*(1 - z^2)
```

### Code Walkthrough

#### Core Value Object

Original-style code:

```python
class Value:
    def __init__(self, data, _children=(), _op=''):
        self.data = data
        self.grad = 0.0
        self._backward = lambda: None
        self._prev = set(_children)
        self._op = _op
```

Line-by-line:

| Line | Meaning |
|---|---|
| `class Value:` | Creates a scalar object that stores data and gradient. |
| `data` | The actual numeric value. |
| `grad` | The derivative of the final output with respect to this value. |
| `_backward` | A function that knows how to backpropagate through the operation that created this value. |
| `_prev` | The parent nodes in the computation graph. |
| `_op` | Debug label for the operation. |

Inputs and outputs:

| Input | Output |
|---|---|
| number like `2.0` | a `Value` object with `.data=2.0`, `.grad=0.0` |

Beginner-friendly version:

```python
class Value:
    def __init__(self, data, _children=(), _op=''):
        # The number this node represents.
        self.data = data

        # d(final_output) / d(this_node), initially unknown.
        self.grad = 0.0

        # Function that will be filled in by operations such as +, *, tanh.
        self._backward = lambda: None

        # Previous nodes used to create this one.
        self._prev = set(_children)

        # Operation name, useful for graph visualization.
        self._op = _op
```

Hidden implementation detail: `_children` is only needed for graph traversal. The math uses local backward functions.

#### Addition

Original-style code:

```python
def __add__(self, other):
    other = other if isinstance(other, Value) else Value(other)
    out = Value(self.data + other.data, (self, other), '+')

    def _backward():
        self.grad += out.grad
        other.grad += out.grad
    out._backward = _backward

    return out
```

Why each line exists:

| Code | Purpose |
|---|---|
| convert `other` | Allows `Value(2) + 3`. |
| create `out` | Stores forward result and graph parents. |
| define `_backward` | Encodes derivative of addition. |
| `+=` | Accumulates gradients from multiple graph paths. |

#### Multiplication

```python
def __mul__(self, other):
    other = other if isinstance(other, Value) else Value(other)
    out = Value(self.data * other.data, (self, other), '*')

    def _backward():
        self.grad += other.data * out.grad
        other.grad += self.data * out.grad
    out._backward = _backward

    return out
```

Mathematical reason:

```text
out = self * other
dout/dself = other
dout/dother = self
```

#### Tanh

```python
def tanh(self):
    x = self.data
    t = (math.exp(2*x) - 1) / (math.exp(2*x) + 1)
    out = Value(t, (self,), 'tanh')

    def _backward():
        self.grad += (1 - t**2) * out.grad
    out._backward = _backward

    return out
```

Inputs and outputs:

| Input | Output |
|---|---|
| any real scalar | value between `-1` and `1` |

Why it matters in neural networks: tanh is a nonlinear activation. Without nonlinearities, stacked layers collapse into one linear function.

#### Backward Pass

```python
def backward(self):
    topo = []
    visited = set()

    def build_topo(v):
        if v not in visited:
            visited.add(v)
            for child in v._prev:
                build_topo(child)
            topo.append(v)

    build_topo(self)
    self.grad = 1.0
    for node in reversed(topo):
        node._backward()
```

Line-by-line:

| Step | Meaning |
|---|---|
| Build topological order | Parents appear before children. |
| Set final gradient to `1.0` | `dL/dL = 1`. |
| Reverse topo order | Backprop goes from output to inputs. |
| Call `_backward` | Each node distributes gradient to parents. |

### Building a Tiny Neural Network

A neuron computes:

```text
n = w1*x1 + w2*x2 + ... + b
out = tanh(n)
```

Code:

```python
class Neuron:
    def __init__(self, nin):
        self.w = [Value(random.uniform(-1, 1)) for _ in range(nin)]
        self.b = Value(random.uniform(-1, 1))

    def __call__(self, x):
        act = sum((wi * xi for wi, xi in zip(self.w, x)), self.b)
        return act.tanh()

    def parameters(self):
        return self.w + [self.b]
```

Training loop:

```python
for k in range(100):
    ypred = [model(x) for x in xs]
    loss = sum((yout - ygt)**2 for ygt, yout in zip(ys, ypred))

    for p in model.parameters():
        p.grad = 0.0
    loss.backward()

    for p in model.parameters():
        p.data += -0.05 * p.grad
```

Hidden details:

- Gradients must be zeroed before every backward pass.
- The update uses negative gradient because gradients point uphill in loss.
- Learning rate controls step size.

### Mathematical Foundations

#### Gradient

For many inputs:

```text
f(w1, w2, ..., wn)
```

the gradient is:

```text
grad f = [df/dw1, df/dw2, ..., df/dwn]
```

It points in the direction of steepest increase.

Gradient descent:

```text
w_new = w_old - learning_rate * grad
```

#### Mean Squared Error

```text
L = sum_i (y_pred_i - y_true_i)^2
```

Derivative for one prediction:

```text
dL/dy_pred = 2(y_pred - y_true)
```

### Mental Models

**How Andrej thinks:** start from the smallest unit, inspect every value, then scale up.

**Engineering intuition:** build a minimal working system before using PyTorch. Autograd is not magic; it is bookkeeping plus chain rule.

**Research intuition:** most deep learning innovations still reduce to differentiable computation graphs optimized by gradient descent.

### Common Mistakes

| Mistake | Fix |
|---|---|
| Forgetting `+=` in gradient propagation | Use accumulation because graphs can branch. |
| Forgetting to zero gradients | Set every parameter `.grad = 0.0` before `backward()`. |
| Updating with `+ lr * grad` | Use `- lr * grad` to minimize loss. |
| Thinking tanh is required | Any suitable nonlinearity can work; tanh is pedagogical here. |

### Interview Notes

**Beginner:** What is a gradient?  
**Answer:** A vector of partial derivatives showing how the output changes with each input.

**Intermediate:** Why do we need topological sort in backprop?  
**Answer:** A node's gradient depends on gradients from downstream nodes, so downstream nodes must be processed first.

**Advanced:** Why must gradients accumulate instead of being assigned?  
**Answer:** A variable can influence the loss through multiple paths. By multivariable chain rule, total derivative is the sum of path contributions.

### Internship Takeaways

Companies expect you to explain backprop without saying "PyTorch does it." You should be able to implement scalar autograd, train a small MLP, and debug gradient signs.

### Chapter Summary

Micrograd teaches that neural network training is ordinary calculus plus graph bookkeeping. Each operation performs a forward computation and stores a local backward rule.

### Revision Sheet

- `data`: scalar value.
- `grad`: derivative of final loss with respect to this value.
- `backward()`: traverses graph in reverse topological order.
- Addition passes gradient unchanged.
- Multiplication swaps operands in the derivative.
- Tanh derivative is `1 - tanh(x)^2`.
- Gradient descent update is `p.data -= lr * p.grad`.

### Flashcards

| Front | Back |
|---|---|
| What is `dL/dL`? | `1` |
| Why topological order? | To backprop only after downstream gradients are known. |
| Why zero gradients? | Gradients accumulate by design. |
| What does tanh add? | Nonlinearity. |

### Key Takeaways

- Backpropagation is local chain rule.
- Autograd engines store computation history.
- Gradient descent changes parameters to reduce loss.

---

## Chapter 2: Makemore Part 1 - Bigram Language Model

### Chapter Overview

**What this video teaches:** how to build a character-level language model that predicts the next character from the previous character.

**Why it matters:** language modeling is the foundation of GPT. The bigram model is the smallest possible language model worth studying.

**Prerequisites:** Python lists, dictionaries, tensors, probability, cross-entropy.

### Concept Explanations

#### Language Model

**What it is:** a model that assigns probabilities to sequences.

For names:

```text
P("emma") = P(e | .) P(m | e) P(m | m) P(a | m) P(. | a)
```

The dot `.` is a special start/end token.

**Why it exists:** if a model can predict the next token well, it has learned statistical structure in the data.

**Analogy:** autocomplete on your phone.

#### Bigram

**What it is:** a pair of consecutive tokens.

```text
emma -> (. e), (e m), (m m), (m a), (a .)
```

**Why it exists:** it is the simplest context model: one character of history.

**Common confusion:** bigram models do not understand full words. They only count local transitions.

#### Probability Table

Visual:

```text
          next char
          a    b    c   ...
prev .   5    2    0
char a   1    0    7
     b   3    4    1
```

Rows are previous characters, columns are next characters.

Normalize rows:

```text
P[next | prev] = count(prev, next) / sum_j count(prev, j)
```

#### Negative Log Likelihood

If the model assigns probability `p` to the correct next character, loss is:

```text
loss = -log(p)
```

Why:

| Probability of correct answer | `-log(p)` |
|---:|---:|
| `1.0` | `0` |
| `0.5` | `0.693` |
| `0.1` | `2.303` |
| `0.01` | `4.605` |

Low probability for correct answer receives high penalty.

### Code Walkthrough

#### Building the Vocabulary

```python
words = open('names.txt', 'r').read().splitlines()
chars = sorted(list(set(''.join(words))))
stoi = {s:i+1 for i,s in enumerate(chars)}
stoi['.'] = 0
itos = {i:s for s,i in stoi.items()}
```

Line-by-line:

| Code | Purpose |
|---|---|
| `read().splitlines()` | Load one name per line. |
| `set(''.join(words))` | Collect unique characters. |
| `stoi` | Character-to-integer mapping. |
| `'.' = 0` | Special boundary token. |
| `itos` | Integer-to-character mapping. |

#### Counting Bigrams

```python
N = torch.zeros((27, 27), dtype=torch.int32)

for w in words:
    chs = ['.'] + list(w) + ['.']
    for ch1, ch2 in zip(chs, chs[1:]):
        ix1 = stoi[ch1]
        ix2 = stoi[ch2]
        N[ix1, ix2] += 1
```

Inputs and outputs:

| Input | Output |
|---|---|
| list of names | `27 x 27` count matrix |

Why each line exists:

- The first dot starts generation.
- The final dot ends generation.
- `zip(chs, chs[1:])` creates adjacent pairs.
- The matrix cell counts how often `ch2` follows `ch1`.

#### Sampling

```python
P = (N + 1).float()
P /= P.sum(1, keepdim=True)

g = torch.Generator().manual_seed(2147483647)
for i in range(5):
    ix = 0
    out = []
    while True:
        p = P[ix]
        ix = torch.multinomial(p, num_samples=1, replacement=True, generator=g).item()
        out.append(itos[ix])
        if ix == 0:
            break
    print(''.join(out))
```

Hidden details:

- `N + 1` is smoothing. It prevents zero probabilities.
- `keepdim=True` keeps shape `(27, 1)` so broadcasting divides each row.
- `torch.multinomial` samples according to probabilities, not argmax.

#### Neural Network Version

```python
xs, ys = [], []
for w in words:
    chs = ['.'] + list(w) + ['.']
    for ch1, ch2 in zip(chs, chs[1:]):
        xs.append(stoi[ch1])
        ys.append(stoi[ch2])

xs = torch.tensor(xs)
ys = torch.tensor(ys)
```

Forward pass:

```python
xenc = F.one_hot(xs, num_classes=27).float()
logits = xenc @ W
counts = logits.exp()
probs = counts / counts.sum(1, keepdims=True)
loss = -probs[torch.arange(xs.nelement()), ys].log().mean()
```

Explanation:

| Code | Meaning |
|---|---|
| `one_hot` | Converts integer index into 27-dimensional vector. |
| `xenc @ W` | Selects one row of `W`; produces logits. |
| `exp` | Makes all scores positive. |
| normalize | Converts scores into probabilities. |
| select correct class | Gets probability assigned to true next char. |
| `-log().mean()` | Cross-entropy loss. |

Beginner-friendly commented version:

```python
# xs: previous-character indices
# ys: next-character target indices
xenc = F.one_hot(xs, num_classes=27).float()

# W is a 27x27 table of learnable scores.
logits = xenc @ W

# Softmax, written manually.
counts = logits.exp()
probs = counts / counts.sum(dim=1, keepdim=True)

# Probability assigned to the correct next character for every example.
correct_probs = probs[torch.arange(xs.numel()), ys]

# Negative log likelihood.
loss = -correct_probs.log().mean()
```

Training:

```python
W = torch.randn((27, 27), generator=g, requires_grad=True)

for k in range(100):
    xenc = F.one_hot(xs, num_classes=27).float()
    logits = xenc @ W
    counts = logits.exp()
    probs = counts / counts.sum(1, keepdims=True)
    loss = -probs[torch.arange(xs.nelement()), ys].log().mean()

    W.grad = None
    loss.backward()
    W.data += -50 * W.grad
```

### Mathematical Foundations

#### Softmax

```text
softmax(z_i) = exp(z_i) / sum_j exp(z_j)
```

It converts arbitrary real logits into probabilities.

#### Cross-Entropy

For one example with true class `y`:

```text
L = -log(p_y)
```

For a batch:

```text
L = -(1/N) sum_i log(p_{i,y_i})
```

#### Regularization as Smoothing

Adding one to counts:

```text
P = (N + 1) / row_sum(N + 1)
```

Neural equivalent:

```text
loss = data_loss + lambda * mean(W^2)
```

This discourages extreme logits and resembles smoothing.

### Mental Models

**Andrej's thought process:** build the count-based model first, then show that a neural network can learn the same table through gradient descent.

**Engineering intuition:** always create a dumb baseline. If your neural model cannot beat it, the bug is probably in data, loss, or training.

### Common Mistakes

| Mistake | Why it hurts |
|---|---|
| Forgetting boundary token | Model never learns how names start/end. |
| Using counts as probabilities | Rows must sum to 1. |
| Taking log of zero | Use smoothing. |
| Confusing logits with probabilities | Logits are raw scores; softmax makes probabilities. |

### Interview Notes

**Beginner:** What is a language model?  
**Answer:** A model that assigns probabilities to token sequences, usually by predicting the next token.

**Intermediate:** Why use negative log likelihood?  
**Answer:** Maximizing probability is equivalent to minimizing negative log probability, and logs turn products into sums.

**Advanced:** Why can a one-hot linear layer represent a bigram table?  
**Answer:** Multiplying a one-hot vector by `W` selects the row corresponding to the previous token.

### Internship Takeaways

You should be able to implement token indexing, train/validation splits, softmax, cross-entropy, sampling, and a baseline language model.

### Chapter Summary

The bigram model predicts the next character from one previous character. It can be implemented by counting or by training a neural table with cross-entropy loss.

### Revision Sheet

- Bigram: two adjacent tokens.
- Language modeling: next-token prediction.
- Logits: raw scores.
- Softmax: scores to probabilities.
- Cross-entropy: `-log(probability of true class)`.
- Smoothing prevents zero probability.

### Flashcards

| Front | Back |
|---|---|
| Why use `.` token? | Marks start and end of names. |
| Shape of bigram count table? | `vocab_size x vocab_size`. |
| What does one-hot @ W do? | Selects a row of `W`. |
| Why log probabilities? | Products become sums and optimization is easier. |

### Key Takeaways

- GPT is a next-token predictor; bigram is the simplest version.
- Cross-entropy trains classifiers and language models.
- Sampling makes model behavior visible.

---

## Chapter 3: Makemore Part 2 - MLP Language Model

### Chapter Overview

**What this video teaches:** how to use a multi-layer perceptron to predict the next character from several previous characters.

**Why it matters:** context length is the first step from bigrams toward modern language models.

**Prerequisites:** tensors, matrix multiplication, softmax, cross-entropy.

### Concept Explanations

#### Embeddings

**What they are:** learned vectors representing tokens.

Instead of one-hot:

```text
a -> [0, 1, 0, 0, ...]
```

embedding:

```text
a -> [0.23, -1.10, 0.04]
```

**Why they exist:** one-hot vectors are sparse and do not encode similarity. Embeddings let the model learn useful geometry.

**Analogy:** each character gets coordinates on a map. Similar characters can end up near each other.

#### Context Window

If block size is 3:

```text
context: [., ., .] -> target e
context: [., ., e] -> target m
context: [., e, m] -> target m
context: [e, m, m] -> target a
```

The model predicts one next character from a fixed-length history.

#### MLP

Architecture:

```text
token ids -> embeddings -> flatten -> hidden layer -> tanh -> logits -> softmax
```

Visual:

```text
[x1 x2 x3]
   | | |
   v v v
[emb emb emb] -> concatenate -> Linear -> tanh -> Linear -> logits
```

### Code Walkthrough

#### Dataset

```python
block_size = 3
X, Y = [], []

for w in words:
    context = [0] * block_size
    for ch in w + '.':
        ix = stoi[ch]
        X.append(context)
        Y.append(ix)
        context = context[1:] + [ix]

X = torch.tensor(X)
Y = torch.tensor(Y)
```

Line-by-line:

| Code | Purpose |
|---|---|
| `[0] * block_size` | Start with all boundary tokens. |
| `w + '.'` | Include end token target. |
| `X.append(context)` | Store current history. |
| `Y.append(ix)` | Store next-character target. |
| `context[1:] + [ix]` | Slide window by one character. |

#### Parameters

```python
C = torch.randn((27, 2))
W1 = torch.randn((6, 100))
b1 = torch.randn(100)
W2 = torch.randn((100, 27))
b2 = torch.randn(27)
parameters = [C, W1, b1, W2, b2]
```

Shapes:

| Parameter | Shape | Meaning |
|---|---:|---|
| `C` | `27 x 2` | embedding table |
| `W1` | `6 x 100` | hidden layer weights |
| `b1` | `100` | hidden bias |
| `W2` | `100 x 27` | output weights |
| `b2` | `27` | output bias |

Why `W1` has `6` input features: block size `3` times embedding dimension `2`.

#### Forward Pass

```python
emb = C[X]
h = torch.tanh(emb.view(-1, 6) @ W1 + b1)
logits = h @ W2 + b2
loss = F.cross_entropy(logits, Y)
```

Inputs and outputs:

| Tensor | Shape |
|---|---:|
| `X` | `N x 3` |
| `emb` | `N x 3 x 2` |
| `emb.view(-1, 6)` | `N x 6` |
| `h` | `N x 100` |
| `logits` | `N x 27` |

Hidden detail: `F.cross_entropy` combines log-softmax and negative log likelihood in a numerically stable way.

#### Mini-batch Training

```python
for i in range(200000):
    ix = torch.randint(0, Xtr.shape[0], (32,))

    emb = C[Xtr[ix]]
    h = torch.tanh(emb.view(-1, 6) @ W1 + b1)
    logits = h @ W2 + b2
    loss = F.cross_entropy(logits, Ytr[ix])

    for p in parameters:
        p.grad = None
    loss.backward()

    lr = 0.1 if i < 100000 else 0.01
    for p in parameters:
        p.data += -lr * p.grad
```

Why mini-batches:

- Full dataset gradients are expensive.
- Mini-batches estimate the gradient.
- Noise in mini-batches can help optimization.

### Mathematical Foundations

#### Matrix Multiplication in a Layer

```text
H = tanh(XW + b)
```

Where:

- `X`: batch of input vectors.
- `W`: weights.
- `b`: bias broadcast across batch.
- `H`: hidden activations.

#### Embedding Lookup

An embedding lookup is equivalent to one-hot matrix multiplication:

```text
C[x] == one_hot(x) @ C
```

But lookup is faster and simpler.

### Visual Learning

```text
Example: "emma"

context     target
[., ., .] -> e
[., ., e] -> m
[., e, m] -> m
[e, m, m] -> a
[m, m, a] -> .
```

### Mental Models

**Andrej's thought process:** turn language modeling into supervised classification examples. Each row of `X` is a small context; each `Y` is the next character.

**Engineering intuition:** shapes are the main source of bugs. Track them aggressively.

### Common Mistakes

| Mistake | Fix |
|---|---|
| Wrong flatten shape | Use `emb.view(emb.shape[0], -1)`. |
| Training on validation data | Split words before building metrics. |
| Too high learning rate | Sweep learning rates logarithmically. |
| Forgetting `requires_grad=True` | Ensure parameters track gradients. |

### Interview Notes

**Beginner:** What is an embedding?  
**Answer:** A learned dense vector representation of a discrete token.

**Intermediate:** Why is embedding lookup like matrix multiplication?  
**Answer:** A one-hot row selects exactly one row from the embedding matrix.

**Advanced:** What limits a fixed-window MLP language model?  
**Answer:** It cannot condition on context outside its fixed block size and does not share computation hierarchically across positions.

### Internship Takeaways

Implement train/dev/test split, mini-batch SGD, embedding lookup, MLP forward pass, and sampling from the model.

### Chapter Summary

The MLP model predicts the next character from multiple previous characters using learned embeddings and nonlinear hidden layers.

### Revision Sheet

- Embedding table shape: `vocab_size x embedding_dim`.
- Context tensor shape: `batch x block_size`.
- Flattened embedding shape: `batch x (block_size * embedding_dim)`.
- Cross-entropy expects logits, not probabilities.

### Flashcards

| Front | Back |
|---|---|
| Why embeddings? | Dense learned token representation. |
| Why mini-batches? | Faster approximate gradients. |
| What does `view(-1, 6)` do? | Flattens context embeddings per example. |
| Why dev set? | Tune hyperparameters without touching test set. |

### Key Takeaways

- More context improves language modeling.
- Embeddings are learned through backprop.
- Tensor shape discipline is essential.

---

## Chapter 4: Makemore Part 3 - Activations, Gradients, and BatchNorm

### Chapter Overview

**What this video teaches:** how initialization, activation distributions, gradient flow, and Batch Normalization affect training.

**Why it matters:** many neural network failures are not architecture failures. They are signal propagation failures.

**Prerequisites:** MLPs, tanh, variance, gradient descent.

### Concept Explanations

#### Activation Saturation

Tanh maps values to `[-1, 1]`.

```text
large negative -> -1
near zero      -> linear-ish
large positive -> +1
```

Derivative:

```text
d tanh(x)/dx = 1 - tanh(x)^2
```

If `tanh(x)` is near `+1` or `-1`, derivative is near zero. Gradients stop flowing.

#### Initialization

Bad initialization can make activations too large or too small.

Goal:

```text
variance in ~= variance out
```

For tanh-like layers, a common scale is:

```text
W ~ N(0, 1/fan_in)
```

or with gain:

```text
std = gain / sqrt(fan_in)
```

#### Batch Normalization

**What it is:** normalize pre-activations across a mini-batch, then scale and shift them with learnable parameters.

Formula:

```text
mu_B = mean(x_B)
sigma_B^2 = var(x_B)
xhat = (x_B - mu_B) / sqrt(sigma_B^2 + eps)
y = gamma * xhat + beta
```

**Why it exists:** keeps activations in a healthy range during training.

**Analogy:** standardizing exam scores before applying a grading curve.

**Common confusion:** BatchNorm behaves differently at train and inference time. During inference it uses running mean and variance.

### Code Walkthrough

#### Better Initialization

```python
W1 = torch.randn((n_embd * block_size, n_hidden)) * (5/3) / ((n_embd * block_size) ** 0.5)
b1 = torch.randn(n_hidden) * 0.01
W2 = torch.randn((n_hidden, vocab_size)) * 0.01
b2 = torch.randn(vocab_size) * 0
```

Why:

- `5/3` is a gain often used for tanh.
- Dividing by `sqrt(fan_in)` stabilizes variance.
- Small final layer makes initial logits less overconfident.
- Zero output bias avoids arbitrary class preference.

#### BatchNorm Forward

```python
hpreact = embcat @ W1 + b1
bnmeani = hpreact.mean(0, keepdim=True)
bnstdi = hpreact.std(0, keepdim=True)
hpreact = bngain * (hpreact - bnmeani) / bnstdi + bnbias
h = torch.tanh(hpreact)
```

Inputs and outputs:

| Tensor | Shape |
|---|---:|
| `hpreact` | `batch x hidden` |
| `bnmeani` | `1 x hidden` |
| `bnstdi` | `1 x hidden` |
| `bngain` | `1 x hidden` |
| `bnbias` | `1 x hidden` |

Hidden detail: BatchNorm introduces coupling between examples in a batch. One example's normalized value depends on other examples.

#### Running Statistics

```python
with torch.no_grad():
    bnmean_running = 0.999 * bnmean_running + 0.001 * bnmeani
    bnstd_running = 0.999 * bnstd_running + 0.001 * bnstdi
```

Why:

- Training uses batch stats.
- Inference needs stable stats without a batch.
- Running stats approximate dataset-wide stats.

### Mathematical Foundations

#### Variance Propagation

If:

```text
y = sum_i w_i x_i
```

and `w_i`, `x_i` are independent with zero mean:

```text
Var(y) = fan_in * Var(w) * Var(x)
```

To keep `Var(y) ~= Var(x)`:

```text
Var(w) ~= 1/fan_in
std(w) ~= 1/sqrt(fan_in)
```

### Visual Learning

Healthy activation histogram:

```text
         ****
      **********
   ****************
------0----------------
```

Saturated tanh histogram:

```text
****                         ****
---- -1 -------- 0 -------- +1 ----
```

### Mental Models

**Andrej's thought process:** inspect activations and gradients directly. If the distributions look wrong, training will be wrong.

**Engineering intuition:** do not debug loss alone. Inspect logits, activations, gradient magnitudes, and update-to-weight ratios.

### Common Mistakes

| Mistake | Fix |
|---|---|
| Initial logits too confident | Scale final layer down. |
| Dead/saturated activations | Improve initialization or normalization. |
| Using batch stats at inference | Use running stats. |
| Forgetting `eps` in BatchNorm | Add numerical stability term. |

### Interview Notes

**Beginner:** What is activation saturation?  
**Answer:** A nonlinear function enters a flat region where gradients become tiny.

**Intermediate:** Why initialize weights with `1/sqrt(fan_in)`?  
**Answer:** To keep activation variance stable across layers.

**Advanced:** Why can BatchNorm regularize training?  
**Answer:** Batch statistics add noise and couple examples, which can reduce overfitting.

### Internship Takeaways

Know initialization, gradient flow, activation saturation, and BatchNorm train/inference differences. These are common debugging and interview topics.

### Chapter Summary

Training quality depends heavily on signal scale. Good initialization and normalization keep activations and gradients in useful ranges.

### Revision Sheet

- Tanh saturates near `-1` and `1`.
- Saturated tanh has near-zero gradient.
- Weight std should scale with `1/sqrt(fan_in)`.
- BatchNorm normalizes, then applies learnable gain and bias.
- Inference BatchNorm uses running statistics.

### Flashcards

| Front | Back |
|---|---|
| Tanh derivative? | `1 - tanh(x)^2` |
| BatchNorm formula? | `gamma * (x - mean)/std + beta` |
| Why small output layer init? | Prevent overconfident initial predictions. |
| What is fan-in? | Number of inputs to a neuron. |

### Key Takeaways

- Neural nets need healthy signal propagation.
- Histograms reveal training pathologies.
- BatchNorm stabilizes but changes train/inference behavior.

---

## Chapter 5: Makemore Part 4 - Becoming a Backprop Ninja

### Chapter Overview

**What this video teaches:** how to manually derive and implement gradients for the full MLP training graph.

**Why it matters:** if you can manually backprop through cross-entropy, matrix multiplication, tanh, and BatchNorm, autograd becomes transparent.

**Prerequisites:** chain rule, matrix multiplication, broadcasting, BatchNorm.

### Concept Explanations

#### Manual Backpropagation

**What it is:** writing derivative code yourself for each forward operation.

**Why it exists:** it develops deep understanding and helps debug custom layers.

**Mental model:** every forward line gets a corresponding backward line in reverse order.

```text
forward:
a = f(x)
b = g(a)
c = h(b)

backward:
dc/db
dc/da = dc/db * db/da
dc/dx = dc/da * da/dx
```

#### Broadcasting Gradients

If forward expands a tensor by broadcasting, backward must sum over expanded dimensions.

Example:

```python
y = x + b  # x: [batch, hidden], b: [hidden]
```

Then:

```text
dL/db = sum over batch of dL/dy
```

### Code Walkthrough

Forward graph:

```python
emb = C[Xb]
embcat = emb.view(emb.shape[0], -1)
hprebn = embcat @ W1 + b1
bnmeani = hprebn.mean(0, keepdim=True)
bndiff = hprebn - bnmeani
bndiff2 = bndiff**2
bnvar = 1/(n-1) * bndiff2.sum(0, keepdim=True)
bnvar_inv = (bnvar + 1e-5)**-0.5
bnraw = bndiff * bnvar_inv
hpreact = bngain * bnraw + bnbias
h = torch.tanh(hpreact)
logits = h @ W2 + b2
loss = F.cross_entropy(logits, Yb)
```

Important backward snippets:

#### Cross-Entropy Backward

For logits:

```text
dL/dlogits = (softmax(logits) - one_hot(target)) / batch_size
```

Code:

```python
dlogits = F.softmax(logits, 1)
dlogits[range(n), Yb] -= 1
dlogits /= n
```

Why this is powerful: softmax plus cross-entropy simplifies beautifully.

#### Linear Layer Backward

Forward:

```python
logits = h @ W2 + b2
```

Backward:

```python
dh = dlogits @ W2.T
dW2 = h.T @ dlogits
db2 = dlogits.sum(0)
```

Shape check:

| Tensor | Shape |
|---|---:|
| `h` | `n x hidden` |
| `W2` | `hidden x vocab` |
| `logits` | `n x vocab` |
| `dW2` | `hidden x vocab` |

#### Tanh Backward

Forward:

```python
h = torch.tanh(hpreact)
```

Backward:

```python
dhpreact = (1.0 - h**2) * dh
```

#### BatchNorm Backward

Compact result:

```python
dhprebn = bngain * bnvar_inv / n * (
    n * dhpreact
    - dhpreact.sum(0)
    - n/(n-1) * bnraw * (dhpreact * bnraw).sum(0)
)
```

Beginner interpretation:

- Start from gradient into normalized output.
- Account for gain.
- Account for variance normalization.
- Account for mean subtraction.
- Sum where batch reductions occurred.

### Mathematical Foundations

#### Softmax Cross-Entropy Derivation

Softmax:

```text
p_i = exp(z_i) / sum_j exp(z_j)
```

Loss for target `y`:

```text
L = -log(p_y)
  = -log(exp(z_y) / sum_j exp(z_j))
  = -z_y + log(sum_j exp(z_j))
```

Derivative:

For class `k`:

```text
dL/dz_k = p_k - 1(k = y)
```

For a batch, divide by `n`.

#### Matrix Multiplication Derivatives

If:

```text
Y = XW
```

then:

```text
dX = dY W^T
dW = X^T dY
```

### Visual Learning

```text
loss
 |
logits
 |
linear W2,b2
 |
tanh
 |
batchnorm
 |
linear W1,b1
 |
embeddings
 |
token ids
```

Backward follows the same stack upward in reverse.

### Mental Models

**Andrej's thought process:** do not trust symbolic comfort. Compare manual gradients against PyTorch gradients and require exact or near-exact agreement.

**Engineering intuition:** gradient checking is a core skill. If manual backward differs, isolate one operation at a time.

### Common Mistakes

| Mistake | Fix |
|---|---|
| Forgetting batch averaging | Divide gradient by batch size when loss is mean. |
| Wrong transpose in matmul backward | Use shape checks. |
| Forgetting broadcast sum | Sum gradients over broadcasted dimensions. |
| Mutating softmax without cloning when needed | Be mindful of in-place ops. |

### Interview Notes

**Beginner:** Why backward order is reverse of forward?  
**Answer:** Later values depend on earlier values, so the loss gradient must flow backward through dependencies.

**Intermediate:** What is `dW` for `Y=XW`?  
**Answer:** `X.T @ dY`.

**Advanced:** Why does softmax-cross-entropy gradient become `p - y`?  
**Answer:** The derivative of `logsumexp` is softmax, and the target logit contributes `-1`.

### Internship Takeaways

Manual gradient derivation distinguishes strong candidates. You do not need to memorize full BatchNorm backward, but you should understand reduction and broadcasting gradients.

### Chapter Summary

Manual backprop maps every forward operation to a reverse derivative operation. Shape discipline and gradient checking are the main tools.

### Revision Sheet

- `dlogits = (softmax - one_hot)/N`.
- `dX = dY @ W.T`.
- `dW = X.T @ dY`.
- `db = dY.sum(0)`.
- `dtanh = (1 - tanh^2) * upstream`.

### Flashcards

| Front | Back |
|---|---|
| Matmul `dW`? | `X.T @ dY` |
| Bias gradient? | Sum upstream gradient over batch. |
| Cross-entropy logit gradient? | `p - y_one_hot` divided by batch size. |
| Broadcast backward rule? | Sum over expanded dimensions. |

### Key Takeaways

- Backprop is reverse-mode chain rule.
- Tensor shapes are proof obligations.
- Autograd can be checked by manual gradients.

---

## Chapter 6: Makemore Part 5 - WaveNet-Style Hierarchical Model

### Chapter Overview

**What this video teaches:** how to improve the character model using a deeper architecture inspired by WaveNet, where nearby tokens are progressively fused.

**Why it matters:** fixed flattening is inefficient. Hierarchical models process context in stages and share structure more naturally.

**Prerequisites:** MLP, embeddings, BatchNorm, tensor reshaping.

### Concept Explanations

#### Hierarchical Context Processing

Instead of flattening all tokens at once:

```text
[x1 x2 x3 x4 x5 x6 x7 x8] -> one big vector
```

WaveNet-style grouping:

```text
[x1 x2] [x3 x4] [x5 x6] [x7 x8]
    ->       ->       ->       ->
  pair features -> bigger features -> output
```

**Why it exists:** local patterns combine into larger patterns. This is useful in audio and language.

#### `torch.flatten` and Reshaping

Shape thinking:

```text
batch x time x channels
```

Group adjacent time steps:

```text
batch x (time/2) x (2*channels)
```

Each layer halves time and increases feature mixing.

### Code Walkthrough

#### Layer Classes

```python
class Linear:
    def __init__(self, fan_in, fan_out, bias=True):
        self.weight = torch.randn((fan_in, fan_out)) / fan_in**0.5
        self.bias = torch.zeros(fan_out) if bias else None

    def __call__(self, x):
        self.out = x @ self.weight
        if self.bias is not None:
            self.out += self.bias
        return self.out

    def parameters(self):
        return [self.weight] + ([] if self.bias is None else [self.bias])
```

Why build classes: to create a tiny PyTorch-like module system and inspect internals.

#### Flatten Consecutive

```python
class FlattenConsecutive:
    def __init__(self, n):
        self.n = n

    def __call__(self, x):
        B, T, C = x.shape
        x = x.view(B, T // self.n, C * self.n)
        if x.shape[1] == 1:
            x = x.squeeze(1)
        self.out = x
        return self.out

    def parameters(self):
        return []
```

Line-by-line:

| Code | Purpose |
|---|---|
| `B, T, C` | Batch, time, channels. |
| `view(B, T//n, C*n)` | Group consecutive tokens. |
| `squeeze(1)` | Remove time dimension when only one group remains. |

#### Sequential Model

```python
model = Sequential([
    Embedding(vocab_size, n_embd),
    FlattenConsecutive(2), Linear(n_embd * 2, n_hidden, bias=False), BatchNorm1d(n_hidden), Tanh(),
    FlattenConsecutive(2), Linear(n_hidden * 2, n_hidden, bias=False), BatchNorm1d(n_hidden), Tanh(),
    FlattenConsecutive(2), Linear(n_hidden * 2, n_hidden, bias=False), BatchNorm1d(n_hidden), Tanh(),
    Linear(n_hidden, vocab_size),
])
```

Visual:

```text
8 chars
 -> 4 groups
 -> 2 groups
 -> 1 group
 -> logits
```

### Mathematical Foundations

Hierarchical grouping is not a new loss. It changes the function class:

```text
P(next | x1..x8) = softmax(f_theta(x1..x8))
```

The improvement comes from a better `f_theta`, not a different objective.

### Mental Models

**Andrej's thought process:** improve architecture while keeping the training loop familiar.

**Engineering intuition:** most model experimentation reuses data loading, loss, optimizer, and sampling. Architecture is the variable.

### Common Mistakes

| Mistake | Fix |
|---|---|
| Wrong `view` shape | Track `B,T,C` at every layer. |
| Using non-contiguous tensors incorrectly | Call `.contiguous()` if needed before `view`. |
| Squeezing wrong dimension | Only squeeze time when it is length 1. |
| Comparing models with different parameter counts unfairly | Track parameter count. |

### Interview Notes

**Beginner:** What does hierarchical processing mean?  
**Answer:** Combining small local groups into larger representations over multiple layers.

**Intermediate:** Why keep shape as `B,T,C`?  
**Answer:** It preserves time structure instead of flattening everything immediately.

**Advanced:** How is this related to convolution?  
**Answer:** Grouping consecutive positions and applying shared transformations resembles local receptive fields, though this implementation is simplified.

### Internship Takeaways

Learn to build module abstractions, inspect tensor shapes, count parameters, and compare architectures under the same training setup.

### Chapter Summary

WaveNet-style makemore processes context hierarchically, grouping neighboring characters into progressively larger features.

### Revision Sheet

- `B`: batch size.
- `T`: time/context length.
- `C`: channels/features.
- `FlattenConsecutive(2)` maps `B,T,C` to `B,T/2,2C`.
- Architecture can improve loss without changing objective.

### Flashcards

| Front | Back |
|---|---|
| Shape convention? | `B x T x C` |
| Why group tokens? | Build hierarchical local features. |
| What does final layer output? | Vocabulary logits. |
| Does WaveNet-style model change the loss? | No, still next-token cross-entropy. |

### Key Takeaways

- Architecture controls how context is processed.
- Reshaping is a core deep learning skill.
- Bigger context requires better structure.

---

## Chapter 7: GPT - Decoder-Only Transformer From Scratch

### Chapter Overview

**What this video teaches:** how to build a GPT-style language model with self-attention, multi-head attention, feedforward layers, residual connections, LayerNorm, and autoregressive generation.

**Why it matters:** this is the core architecture behind modern LLMs.

**Prerequisites:** language modeling, embeddings, cross-entropy, matrix multiplication, PyTorch modules.

### Concept Explanations

#### Tokenization at Character Level

The lecture uses a simple character tokenizer first:

```text
text -> characters -> integer ids -> model -> next character id
```

This keeps focus on the Transformer.

#### Autoregressive Modeling

GPT predicts the next token from previous tokens:

```text
P(x1, x2, ..., xT) = product_t P(xt | x1, ..., x_{t-1})
```

During training, all positions are predicted in parallel with a causal mask.

During generation, tokens are sampled one at a time.

#### Self-Attention

**What it is:** a mechanism where each token computes how much it should look at previous tokens.

Each token creates:

- Query: what am I looking for?
- Key: what do I contain?
- Value: what information do I offer?

Formula:

```text
Attention(Q,K,V) = softmax(QK^T / sqrt(d_k)) V
```

**Analogy:** in a classroom, a student asks a question (query), classmates have topic labels (keys), and their knowledge is the value. The student listens more to relevant classmates.

#### Causal Mask

GPT must not see future tokens.

```text
allowed attention:

token 1: 1
token 2: 1 2
token 3: 1 2 3
token 4: 1 2 3 4
```

Mask:

```text
1 0 0 0
1 1 0 0
1 1 1 0
1 1 1 1
```

#### Multi-Head Attention

Multiple attention heads let the model attend to different relationships.

```text
head 1: syntax
head 2: nearby characters
head 3: long-range dependency
head 4: punctuation
```

#### Residual Connections

```text
x = x + attention(layernorm(x))
x = x + feedforward(layernorm(x))
```

They help gradients flow and let layers learn modifications rather than complete transformations.

#### LayerNorm

LayerNorm normalizes features within each example/token, unlike BatchNorm which normalizes across the batch.

Formula:

```text
xhat = (x - mean_features(x)) / sqrt(var_features(x) + eps)
y = gamma*xhat + beta
```

LayerNorm is stable for sequence models and generation because it does not depend on batch statistics.

### Code Walkthrough

#### Data Batching

```python
def get_batch(split):
    data = train_data if split == 'train' else val_data
    ix = torch.randint(len(data) - block_size, (batch_size,))
    x = torch.stack([data[i:i+block_size] for i in ix])
    y = torch.stack([data[i+1:i+block_size+1] for i in ix])
    return x, y
```

Inputs and outputs:

| Tensor | Shape | Meaning |
|---|---:|---|
| `x` | `B x T` | input token ids |
| `y` | `B x T` | next-token targets |

#### Bigram Baseline Module

```python
class BigramLanguageModel(nn.Module):
    def __init__(self, vocab_size):
        super().__init__()
        self.token_embedding_table = nn.Embedding(vocab_size, vocab_size)

    def forward(self, idx, targets=None):
        logits = self.token_embedding_table(idx)
        if targets is None:
            loss = None
        else:
            B, T, C = logits.shape
            logits = logits.view(B*T, C)
            targets = targets.view(B*T)
            loss = F.cross_entropy(logits, targets)
        return logits, loss
```

Hidden detail: `F.cross_entropy` expects class dimension as second dimension, so flatten `B*T` examples.

#### Single Attention Head

```python
class Head(nn.Module):
    def __init__(self, head_size):
        super().__init__()
        self.key = nn.Linear(n_embd, head_size, bias=False)
        self.query = nn.Linear(n_embd, head_size, bias=False)
        self.value = nn.Linear(n_embd, head_size, bias=False)
        self.register_buffer('tril', torch.tril(torch.ones(block_size, block_size)))
        self.dropout = nn.Dropout(dropout)

    def forward(self, x):
        B, T, C = x.shape
        k = self.key(x)
        q = self.query(x)
        wei = q @ k.transpose(-2, -1) * C**-0.5
        wei = wei.masked_fill(self.tril[:T, :T] == 0, float('-inf'))
        wei = F.softmax(wei, dim=-1)
        wei = self.dropout(wei)
        v = self.value(x)
        out = wei @ v
        return out
```

Important correction: the scale should conceptually use `head_size**-0.5`, not the original embedding dimension if `C` refers to `n_embd`. Many implementations write:

```python
wei = q @ k.transpose(-2, -1) * k.shape[-1]**-0.5
```

Line-by-line:

| Code | Purpose |
|---|---|
| `key/query/value` | Learn projections for attention. |
| `tril` | Lower triangular causal mask. |
| `q @ k.T` | Pairwise token affinity. |
| scale | Prevent huge dot products. |
| `masked_fill` | Block future positions. |
| `softmax` | Convert affinities to attention weights. |
| `wei @ v` | Weighted sum of values. |

#### Multi-Head Attention

```python
class MultiHeadAttention(nn.Module):
    def __init__(self, num_heads, head_size):
        super().__init__()
        self.heads = nn.ModuleList([Head(head_size) for _ in range(num_heads)])
        self.proj = nn.Linear(n_embd, n_embd)
        self.dropout = nn.Dropout(dropout)

    def forward(self, x):
        out = torch.cat([h(x) for h in self.heads], dim=-1)
        out = self.dropout(self.proj(out))
        return out
```

#### Feedforward Network

```python
class FeedForward(nn.Module):
    def __init__(self, n_embd):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(n_embd, 4 * n_embd),
            nn.ReLU(),
            nn.Linear(4 * n_embd, n_embd),
            nn.Dropout(dropout),
        )

    def forward(self, x):
        return self.net(x)
```

Why `4 * n_embd`: common Transformer design expands feature dimension inside the MLP.

#### Transformer Block

```python
class Block(nn.Module):
    def __init__(self, n_embd, n_head):
        super().__init__()
        head_size = n_embd // n_head
        self.sa = MultiHeadAttention(n_head, head_size)
        self.ffwd = FeedForward(n_embd)
        self.ln1 = nn.LayerNorm(n_embd)
        self.ln2 = nn.LayerNorm(n_embd)

    def forward(self, x):
        x = x + self.sa(self.ln1(x))
        x = x + self.ffwd(self.ln2(x))
        return x
```

This is pre-norm Transformer style.

#### Full GPT Model

```python
class GPTLanguageModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.token_embedding_table = nn.Embedding(vocab_size, n_embd)
        self.position_embedding_table = nn.Embedding(block_size, n_embd)
        self.blocks = nn.Sequential(*[Block(n_embd, n_head=n_head) for _ in range(n_layer)])
        self.ln_f = nn.LayerNorm(n_embd)
        self.lm_head = nn.Linear(n_embd, vocab_size)

    def forward(self, idx, targets=None):
        B, T = idx.shape
        tok_emb = self.token_embedding_table(idx)
        pos_emb = self.position_embedding_table(torch.arange(T, device=device))
        x = tok_emb + pos_emb
        x = self.blocks(x)
        x = self.ln_f(x)
        logits = self.lm_head(x)

        if targets is None:
            loss = None
        else:
            B, T, C = logits.shape
            loss = F.cross_entropy(logits.view(B*T, C), targets.view(B*T))
        return logits, loss
```

#### Generation

```python
@torch.no_grad()
def generate(self, idx, max_new_tokens):
    for _ in range(max_new_tokens):
        idx_cond = idx[:, -block_size:]
        logits, loss = self(idx_cond)
        logits = logits[:, -1, :]
        probs = F.softmax(logits, dim=-1)
        idx_next = torch.multinomial(probs, num_samples=1)
        idx = torch.cat((idx, idx_next), dim=1)
    return idx
```

Why crop to `block_size`: positional embeddings and attention mask are only defined up to the model's context length.

### Mathematical Foundations

#### Attention Derivation

For each token vector `x_t`:

```text
q_t = x_t W_Q
k_t = x_t W_K
v_t = x_t W_V
```

Score from token `t` to token `s`:

```text
score(t,s) = q_t dot k_s / sqrt(d_k)
```

Weights:

```text
a(t,s) = softmax_s(score(t,s))
```

Output:

```text
out_t = sum_s a(t,s) v_s
```

#### Why Scale by `sqrt(d_k)`

If query and key components have variance 1, their dot product over `d_k` terms has variance `d_k`. Large variance makes softmax too sharp. Dividing by `sqrt(d_k)` keeps scores in a healthier range.

### Visual Learning

```text
tokens
  |
token embedding + position embedding
  |
Transformer block x N
  |-- LayerNorm
  |-- Causal Multi-Head Attention
  |-- Residual Add
  |-- LayerNorm
  |-- FeedForward
  |-- Residual Add
  |
final LayerNorm
  |
linear to vocab logits
  |
cross-entropy / sampling
```

### Mental Models

**Andrej's thought process:** start with a bigram baseline, then add one Transformer idea at a time: averaging, attention weights, multi-heads, feedforward, residuals, normalization.

**Engineering intuition:** attention is just weighted aggregation. The complexity comes from shapes, masking, and efficient batching.

**Research intuition:** Transformers replace recurrence with content-based communication between tokens.

### Common Mistakes

| Mistake | Fix |
|---|---|
| Forgetting causal mask | Model cheats by seeing future tokens. |
| Passing probabilities to cross-entropy | Pass logits. |
| Not cropping context during generation | Keep only last `block_size` tokens. |
| Wrong attention scaling | Scale by key/query head dimension. |
| Shape mismatch in loss | Flatten `B*T` predictions and targets. |

### Interview Notes

**Beginner:** What does GPT predict?  
**Answer:** The next token given previous tokens.

**Intermediate:** Why use causal masking?  
**Answer:** To prevent the model from using future tokens during training.

**Advanced:** Why does multi-head attention help?  
**Answer:** Different heads can learn different attention patterns and representation subspaces.

### Internship Takeaways

You should implement a small GPT from memory: embeddings, positional embeddings, masked self-attention, multi-head attention, feedforward, residuals, LayerNorm, generation.

### Chapter Summary

GPT is a stack of causal Transformer blocks trained with next-token cross-entropy. Self-attention lets each token gather information from earlier tokens.

### Revision Sheet

- GPT is decoder-only.
- Training predicts all next tokens in parallel.
- Generation samples one token at a time.
- Attention formula: `softmax(QK^T/sqrt(d_k))V`.
- Causal mask blocks future tokens.
- Residuals and LayerNorm stabilize deep training.

### Flashcards

| Front | Back |
|---|---|
| Query? | What this token is looking for. |
| Key? | What this token offers for matching. |
| Value? | Information passed if attended to. |
| Why positional embeddings? | Attention alone has no order information. |
| Why residual connections? | Improve gradient flow and preserve information. |

### Key Takeaways

- GPT is next-token prediction plus causal self-attention.
- Attention is differentiable information routing.
- Masking is non-negotiable for autoregressive models.

---

## Chapter 8: GPT Tokenizer - Byte Pair Encoding

### Chapter Overview

**What this video teaches:** how tokenizers convert raw text into model tokens, focusing on Byte Pair Encoding.

**Why it matters:** LLMs do not directly see words or characters. Tokenization shapes context length, vocabulary, compression, multilingual behavior, and many model quirks.

**Prerequisites:** strings, bytes, dictionaries, frequency counts.

### Concept Explanations

#### Tokenization

**What it is:** converting text into integer IDs.

```text
"hello" -> [15339]
```

or character-level:

```text
"hello" -> [h, e, l, l, o]
```

**Why it exists:** neural networks operate on integer token IDs mapped to embeddings.

#### Unicode and Bytes

Text characters are Unicode code points. Computers store them as bytes using encodings like UTF-8.

Example:

```text
"a" -> one byte
"你" -> multiple bytes in UTF-8
```

Byte-level tokenization starts from bytes `0..255`, so every possible text can be represented.

#### Byte Pair Encoding

**What it is:** an algorithm that repeatedly merges the most frequent adjacent pair of tokens.

Start:

```text
l o w   l o w e r
```

Frequent pair `l o` becomes `lo`:

```text
lo w   lo w e r
```

Then maybe `lo w` becomes `low`:

```text
low   low e r
```

**Why it exists:** it balances characters and words. Common sequences become single tokens; rare words can still be decomposed.

### Code Walkthrough

#### Counting Pairs

```python
def get_stats(ids):
    counts = {}
    for pair in zip(ids, ids[1:]):
        counts[pair] = counts.get(pair, 0) + 1
    return counts
```

Inputs and outputs:

| Input | Output |
|---|---|
| `[1, 2, 1, 2, 3]` | `{(1,2): 2, (2,1): 1, (2,3): 1}` |

#### Merging a Pair

```python
def merge(ids, pair, idx):
    newids = []
    i = 0
    while i < len(ids):
        if i < len(ids) - 1 and ids[i] == pair[0] and ids[i+1] == pair[1]:
            newids.append(idx)
            i += 2
        else:
            newids.append(ids[i])
            i += 1
    return newids
```

Why each line exists:

- Use `while` because merging consumes either one or two tokens.
- If pair matches, append new token ID.
- Otherwise copy current token.

#### Training BPE

```python
vocab_size = 276
num_merges = vocab_size - 256
ids = list(text.encode("utf-8"))
merges = {}

for i in range(num_merges):
    stats = get_stats(ids)
    pair = max(stats, key=stats.get)
    idx = 256 + i
    ids = merge(ids, pair, idx)
    merges[pair] = idx
```

Hidden details:

- Base vocabulary is 256 byte values.
- New merged tokens start at ID 256.
- Merge order matters and must be saved.

#### Encoding

```python
def encode(text):
    tokens = list(text.encode("utf-8"))
    while len(tokens) >= 2:
        stats = get_stats(tokens)
        pair = min(stats, key=lambda p: merges.get(p, float("inf")))
        if pair not in merges:
            break
        idx = merges[pair]
        tokens = merge(tokens, pair, idx)
    return tokens
```

Why `min` by merge rank: encoding must apply merges in the same order learned during training.

#### Decoding

```python
vocab = {idx: bytes([idx]) for idx in range(256)}
for (p0, p1), idx in merges.items():
    vocab[idx] = vocab[p0] + vocab[p1]

def decode(ids):
    tokens = b"".join(vocab[idx] for idx in ids)
    text = tokens.decode("utf-8", errors="replace")
    return text
```

Why `errors="replace"`: arbitrary byte sequences may not form valid UTF-8.

### Mathematical Foundations

BPE is compression by greedy pair replacement. At each step:

```text
pair* = argmax_pair count(pair)
```

Then all non-overlapping occurrences of `pair*` are replaced by a new symbol.

It is not trained by gradient descent. It is a preprocessing algorithm.

### Visual Learning

```text
raw text
  |
UTF-8 bytes
  |
repeated BPE merges
  |
token IDs
  |
embedding lookup
  |
Transformer
```

### Mental Models

**Andrej's thought process:** tokenization is part of the model interface. Many LLM surprises are tokenizer surprises.

**Engineering intuition:** always inspect tokens. Token count affects cost, context usage, and model behavior.

### Common Mistakes

| Mistake | Fix |
|---|---|
| Treating Python string length as token length | Use tokenizer to count tokens. |
| Forgetting UTF-8 bytes | Unicode characters may be multiple bytes. |
| Applying merges in wrong order | Use learned merge ranks. |
| Assuming tokens equal words | Tokens can be word pieces, bytes, spaces, or punctuation. |

### Interview Notes

**Beginner:** Why tokenize text?  
**Answer:** Models need integer IDs that can be mapped to embeddings.

**Intermediate:** Why byte-level BPE?  
**Answer:** It can represent any text while compressing common byte sequences.

**Advanced:** How can tokenization affect model behavior?  
**Answer:** It changes sequence length, rare word decomposition, multilingual efficiency, and the units the model learns over.

### Internship Takeaways

Understand BPE, Unicode, UTF-8, token IDs, encode/decode, vocabulary size, and why token counting matters for LLM applications.

### Chapter Summary

BPE tokenization starts from bytes and repeatedly merges frequent pairs to build a vocabulary of reusable text chunks.

### Revision Sheet

- Unicode is abstract text; UTF-8 is bytes.
- Byte vocabulary has 256 base tokens.
- BPE repeatedly merges frequent adjacent pairs.
- Encoding applies learned merges by rank.
- Decoding maps token IDs back to byte sequences, then UTF-8 text.

### Flashcards

| Front | Back |
|---|---|
| Base byte vocab size? | 256 |
| Is BPE gradient-trained? | No. |
| Why save merge order? | Encoding must reproduce training merges. |
| Can one word be many tokens? | Yes. |

### Key Takeaways

- Tokenization is foundational for LLM engineering.
- BPE is compression-like greedy merging.
- Inspect tokens before debugging model behavior.

---

# Complete Neural Networks Roadmap

```text
Calculus
  -> derivative
  -> chain rule
  -> gradient
  -> backpropagation
  -> autograd
  -> gradient descent
  -> neural networks
  -> language modeling
  -> embeddings
  -> MLPs
  -> initialization and normalization
  -> manual backprop
  -> hierarchical architectures
  -> attention
  -> Transformers
  -> GPT
  -> tokenization
  -> LLM engineering
```

| Stage | Core Question | Implementation |
|---|---|---|
| Autograd | How do gradients flow? | Micrograd |
| Bigram LM | How do we predict next token? | Count table and neural table |
| MLP LM | How do we use context? | Embeddings + MLP |
| Training health | Why does training fail? | Initialization + BatchNorm |
| Manual gradients | Do we understand backprop? | Hand-derived backward pass |
| Architecture | How do we process longer context? | WaveNet-style hierarchy |
| Transformer | How do tokens communicate? | Causal self-attention |
| Tokenizer | What are model inputs? | Byte Pair Encoding |

---

# Master Formula Sheet

## Derivatives

```text
df/dx = lim_{h -> 0} [f(x+h)-f(x)]/h
d(x^n)/dx = n*x^(n-1)
d(a+b)/da = 1
d(a*b)/da = b
d tanh(x)/dx = 1 - tanh(x)^2
```

## Chain Rule

```text
dz/dx = dz/dy * dy/dx
```

## Gradient Descent

```text
theta <- theta - learning_rate * grad_theta(L)
```

## MSE

```text
L = sum_i (y_pred_i - y_i)^2
dL/dy_pred = 2(y_pred - y)
```

## Softmax

```text
p_i = exp(z_i) / sum_j exp(z_j)
```

## Cross-Entropy

```text
L = -log(p_y)
dL/dz = softmax(z) - one_hot(y)
```

## Embedding Lookup

```text
embedding(x) = C[x]
```

Equivalent:

```text
one_hot(x) @ C
```

## Linear Layer

```text
Y = XW + b
dX = dY W^T
dW = X^T dY
db = sum_batch dY
```

## BatchNorm

```text
mu = mean(x)
var = mean((x-mu)^2)
xhat = (x-mu)/sqrt(var+eps)
y = gamma*xhat + beta
```

## LayerNorm

```text
mu = mean over features
var = variance over features
y = gamma * (x-mu)/sqrt(var+eps) + beta
```

## Attention

```text
Q = XW_Q
K = XW_K
V = XW_V
Attention(Q,K,V) = softmax(QK^T / sqrt(d_k))V
```

## Autoregressive Factorization

```text
P(x1,...,xT) = product_t P(xt | x1,...,x_{t-1})
```

## BPE

```text
pair* = argmax_pair count(pair)
replace pair* with new token
```

---

# Master Glossary

| Term | Meaning |
|---|---|
| Activation | Output of a neuron/layer after transformation. |
| Autograd | Automatic differentiation system. |
| Backpropagation | Reverse-mode chain rule for computing gradients. |
| BatchNorm | Normalization using batch statistics. |
| Bigram | Pair of adjacent tokens. |
| Causal mask | Mask that prevents attention to future tokens. |
| Chain rule | Derivative rule for composed functions. |
| Cross-entropy | Loss for classification and language modeling. |
| Embedding | Learned dense vector for a token. |
| Gradient | Vector of partial derivatives. |
| Gradient descent | Optimization by moving opposite the gradient. |
| Head | One attention mechanism in multi-head attention. |
| LayerNorm | Normalization over features of each token/example. |
| Logit | Raw unnormalized model score. |
| MLP | Multi-layer perceptron. |
| Parameter | Learnable tensor updated by training. |
| Softmax | Converts logits into probabilities. |
| Token | Discrete unit processed by a language model. |
| Tokenizer | Converts text to token IDs and back. |
| Transformer | Architecture based on attention, MLPs, residuals, and normalization. |

---

# Neural Network Implementation Guide

## Build Micrograd

1. Create `Value` with `data`, `grad`, `_prev`, `_op`, `_backward`.
2. Implement arithmetic: `+`, `*`, power, negation, subtraction, division.
3. Implement nonlinearities: `tanh`, optionally `exp`.
4. In every operation, create output and define local `_backward`.
5. Implement topological traversal.
6. Set final node gradient to `1.0`.
7. Traverse in reverse and call `_backward`.
8. Build `Neuron`, `Layer`, and `MLP`.
9. Train with MSE and gradient descent.

## Build an MLP Language Model

1. Load names.
2. Build vocabulary and `stoi`/`itos`.
3. Build context-target dataset.
4. Split train/dev/test.
5. Create embedding table `C`.
6. Flatten context embeddings.
7. Add hidden layer, nonlinearity, output layer.
8. Train with mini-batch cross-entropy.
9. Sample names autoregressively.
10. Tune embedding size, hidden size, context length, learning rate.

## Build a GPT-Style Transformer

1. Tokenize text to integer IDs.
2. Create `get_batch`.
3. Build token and position embeddings.
4. Implement causal attention head.
5. Add multi-head attention.
6. Add feedforward network.
7. Add residual connections.
8. Add LayerNorm.
9. Stack Transformer blocks.
10. Train with cross-entropy.
11. Generate by cropping context, sampling next token, and appending.

## Build a BPE Tokenizer

1. Convert text to UTF-8 bytes.
2. Count adjacent token pairs.
3. Merge the most frequent pair into a new token.
4. Repeat until desired vocabulary size.
5. Save merge table.
6. Build vocabulary for decoding.
7. Encode text by applying merges in rank order.
8. Decode token IDs to bytes and then text.

---

# Final Revision Guide

## One-Page Mental Model

A neural network is a differentiable program. It maps inputs to outputs using parameters. A loss measures how wrong the outputs are. Backpropagation computes how each parameter affected the loss. Gradient descent updates parameters to reduce the loss.

Language models are neural networks trained to predict the next token. GPT is a language model where tokens communicate through masked self-attention. Tokenizers decide which integer tokens represent raw text.

## What To Memorize

- Chain rule.
- Gradient descent update.
- Softmax and cross-entropy.
- `dlogits = softmax - one_hot`.
- Attention formula.
- BatchNorm and LayerNorm formulas.
- Shapes in Transformer: `B x T x C`.

## What To Understand Deeply

- Why gradients flow backward.
- Why logits are not probabilities.
- Why initialization affects training.
- Why normalization helps.
- Why attention needs masking.
- Why tokenization changes model behavior.

## Code To Implement From Memory

1. Scalar `Value` autograd.
2. Bigram count model.
3. MLP language model with embeddings.
4. Manual softmax cross-entropy.
5. Single causal attention head.
6. Transformer block.
7. Autoregressive generation loop.
8. BPE pair counting and merging.

## Interview-Ready Questions

| Question | Short Answer |
|---|---|
| What is backpropagation? | Efficient reverse-mode chain rule over a computation graph. |
| Why use cross-entropy? | It penalizes low probability assigned to the correct class. |
| What is an embedding? | A learned dense vector representation of a token. |
| Why attention? | It lets tokens dynamically gather information from other tokens. |
| Why causal mask? | It prevents next-token models from seeing future tokens. |
| BatchNorm vs LayerNorm? | BatchNorm normalizes across batch; LayerNorm normalizes across features per example/token. |
| What is BPE? | Greedy frequent-pair merging tokenizer. |

---

# AI/ML Internship Preparation Section

## What Companies Expect

For beginner ML internships:

- Python fluency.
- PyTorch basics.
- Ability to train and evaluate models.
- Understanding of overfitting, train/dev/test splits.
- Basic math: gradients, matrix multiplication, probability.

For LLM-oriented internships:

- Tokenization.
- Embeddings.
- Transformer architecture.
- Attention masks.
- Fine-tuning and inference basics.
- Ability to read model code and debug tensor shapes.

## Frequently Asked Concepts

| Concept | Why asked |
|---|---|
| Backpropagation | Tests real neural network understanding. |
| Cross-entropy | Central classification/language modeling loss. |
| Embeddings | Core representation concept. |
| Attention | Foundation of Transformers. |
| Normalization | Common training stability topic. |
| Tokenization | Essential for LLM applications. |

## Most Important Projects

1. Implement `micrograd`.
2. Train a character-level name generator.
3. Build a mini GPT on a small text dataset.
4. Build a BPE tokenizer.
5. Create a small LLM inference demo that shows tokenization, generation, temperature, and top-k sampling.

## Study Plan

| Week | Goal |
|---:|---|
| 1 | Micrograd and calculus foundations |
| 2 | Bigram and MLP makemore |
| 3 | Initialization, BatchNorm, manual backprop |
| 4 | WaveNet-style model and PyTorch module structure |
| 5 | GPT from scratch |
| 6 | Tokenizer and final projects |

## Final Checklist

- [ ] Can explain derivative, gradient, and chain rule.
- [ ] Can implement `Value.backward()`.
- [ ] Can explain softmax cross-entropy.
- [ ] Can build a context-target language modeling dataset.
- [ ] Can train an embedding MLP.
- [ ] Can debug activation and gradient histograms.
- [ ] Can derive `dlogits = p - y`.
- [ ] Can implement causal self-attention.
- [ ] Can build a mini GPT.
- [ ] Can implement BPE encode/decode.

