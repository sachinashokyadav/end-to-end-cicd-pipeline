const express = require('express');
const client = require('prom-client');

const app = express();
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const devopsProducts = [
  { id: 1, name: 'Jenkins Pro', category: 'CI/CD', price: 299, description: 'Enterprise CI/CD automation', image: 'https://www.jenkins.io/images/logos/jenkins/jenkins.svg' },
  { id: 2, name: 'Docker Enterprise', category: 'Containerization', price: 199, description: 'Container platform', image: 'https://www.docker.com/wp-content/uploads/2022/03/vertical-logo-monochromatic.png' },
  { id: 3, name: 'Kubernetes Toolkit', category: 'Orchestration', price: 399, description: 'K8s management suite', image: 'https://kubernetes.io/images/kubernetes-horizontal-color.png' },
  { id: 4, name: 'Terraform Cloud', category: 'IaC', price: 149, description: 'Infrastructure as Code', image: 'https://www.datocms-assets.com/2885/1629941242-logo-terraform-main.svg' },
  { id: 5, name: 'Ansible Tower', category: 'Configuration', price: 249, description: 'Automation platform', image: 'https://logos-world.net/wp-content/uploads/2021/01/Ansible-Logo.png' },
  { id: 6, name: 'Prometheus Stack', category: 'Monitoring', price: 179, description: 'Monitoring & alerting', image: 'https://prometheus.io/assets/prometheus_logo_grey.svg' },
  { id: 7, name: 'GitLab Ultimate', category: 'DevOps Platform', price: 499, description: 'Complete DevOps lifecycle', image: 'https://about.gitlab.com/images/press/logo/svg/gitlab-logo-500.svg' },
  { id: 8, name: 'AWS DevOps Suite', category: 'Cloud', price: 599, description: 'AWS native DevOps tools', image: 'https://a0.awsstatic.com/libra-css/images/logos/aws_smile-header-desktop-en-white_59x35.png' }
];

app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok', products: devopsProducts.length }));
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.get('/', (req, res) => {
  const html = `
    <html><head><title>DevOps Store</title><style>
      body{font-family:Arial;margin:40px;background:#f5f5f5}
      .header{text-align:center;color:#333;margin-bottom:30px}
      .products{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px}
      .product{background:white;padding:20px;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1)}
      .product img{width:100px;height:60px;object-fit:contain;margin-bottom:10px}
      .price{color:#e74c3c;font-weight:bold;font-size:18px}
      .category{background:#3498db;color:white;padding:4px 8px;border-radius:4px;font-size:12px;display:inline-block;margin-top:10px}
    </style></head><body>
      <div class="header">
        <h1>🚀 DevOps Product Store</h1>
        <p>Your one-stop shop for DevOps tools & platforms</p>
      </div>
      <div class="products">
        ${devopsProducts.map(p => `
          <div class="product">
            <img src="${p.image}" alt="${p.name}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjYwIiB2aWV3Qm94PSIwIDAgMTAwIDYwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iNjAiIGZpbGw9IiNlY2YwZjEiLz48dGV4dCB4PSI1MCIgeT0iMzUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzM0OThkYiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+JHtwLm5hbWV9PC90ZXh0Pjwvc3ZnPg=='">
            <h3>${p.name}</h3>
            <p>${p.description}</p>
            <div class="price">$${p.price}</div>
            <span class="category">${p.category}</span>
          </div>
        `).join('')}
      </div>
    </body></html>
  `;
  res.send(html);
});

app.get('/api/products', (req, res) => {
  const { category } = req.query;
  const products = category ? devopsProducts.filter(p => p.category.toLowerCase().includes(category.toLowerCase())) : devopsProducts;
  res.json({ products, total: products.length });
});

app.get('/api/products/:id', (req, res) => {
  const product = devopsProducts.find(p => p.id === parseInt(req.params.id));
  product ? res.json(product) : res.status(404).json({ error: 'Product not found' });
});

app.get('/api/categories', (req, res) => {
  const categories = [...new Set(devopsProducts.map(p => p.category))];
  res.json({ categories });
});

module.exports = app;