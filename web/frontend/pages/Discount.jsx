import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Page,
  Layout,
  Card,
  Button,
  TextField,
  Text,
  RadioButton,
  BlockStack,
  InlineStack,
  Badge,
  Modal,
  Loading,
  EmptyState,
  ResourceList,
  ResourceItem,
  Avatar,
  ButtonGroup,
  Checkbox,
} from "@shopify/polaris";
//have to fine a way to show toast
// import { Toast } from "@shopify/app-bridge-react";

const Discount = () => {
  const [products, setProducts] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [bundleName, setBundleName] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [editingBundle, setEditingBundle] = useState(null);

  ///for now inital data to for testing
  useEffect(() => {
    setProducts([
      {
        id: "1",
        title: "iPhone 15 Pro",
        price: 999.99,
        image: "https://via.placeholder.com/40",
      },
      {
        id: "2",
        title: "MacBook Air M2",
        price: 1299.99,
        image: "https://via.placeholder.com/40",
      },
      {
        id: "3",
        title: "AirPods Pro",
        price: 249.99,
        image: "https://via.placeholder.com/40",
      },
      {
        id: "4",
        title: "iPad Pro",
        price: 799.99,
        image: "https://via.placeholder.com/40",
      },
      {
        id: "5",
        title: "Apple Watch",
        price: 399.99,
        image: "https://via.placeholder.com/40",
      },
    ]);

    setBundles([
      {
        id: 1,
        name: "Apple Bundle Deal",
        products: ["iPhone 15 Pro", "AirPods Pro"],
        discountType: "percentage",
        discountValue: 15,
        isActive: true,
        totalValue: 1249.98,
      },
      {
        id: 2,
        name: "Work From Home Bundle",
        products: ["MacBook Air M2", "iPad Pro"],
        discountType: "fixed",
        discountValue: 200,
        isActive: true,
        totalValue: 2099.98,
      },
    ]);
  }, []);

  const handleProductSelection = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const calculateTotalPrice = () => {
    return selectedProducts.reduce((total, productId) => {
      const product = products.find((p) => p.id === productId);
      return total + (product?.price || 0);
    }, 0);
  };

  const calculateDiscountedPrice = () => {
    const total = calculateTotalPrice();
    if (discountType === "percentage") {
      return total - total * (parseFloat(discountValue) / 100);
    } else {
      return total - parseFloat(discountValue);
    }
  };

  const handleSaveBundle = () => {
    if (!bundleName || selectedProducts.length < 2 || !discountValue) {
      console.log("had problem");
      return;
      //   return (
      //     <Toast
      //       content="Please fill all required fields and select at least 2 products"
      //       isError={true}
      //     />
      //   );
    }

    const newBundle = {
      id: editingBundle?.id || Date.now(),
      name: bundleName,
      products: selectedProducts.map(
        (id) => products.find((p) => p.id === id)?.title
      ),
      discountType,
      discountValue: parseFloat(discountValue),
      isActive: true,
      totalValue: calculateTotalPrice(),
    };

    if (editingBundle) {
      setBundles((prev) =>
        prev.map((b) => (b.id === editingBundle.id ? newBundle : b))
      );
      //   return <Toast content="Bundle updated successfully!" />;
    } else {
      setBundles((prev) => [...prev, newBundle]);
    }

    resetForm();
    setShowCreateModal(false);
  };

  const resetForm = () => {
    setBundleName("");
    setSelectedProducts([]);
    setDiscountType("percentage");
    setDiscountValue("");
    setEditingBundle(null);
  };

  const handleEditBundle = (bundle) => {
    setEditingBundle(bundle);
    setBundleName(bundle.name);
    setSelectedProducts(
      bundle.products
        .map((title) => products.find((p) => p.title === title)?.id)
        .filter(Boolean)
    );
    setDiscountType(bundle.discountType);
    setDiscountValue(bundle.discountValue.toString());
    setShowCreateModal(true);
  };

  const handleDeleteBundle = (bundleId) => {
    setBundles((prev) => prev.filter((b) => b.id !== bundleId));
  };

  const toggleBundleStatus = (bundleId) => {
    setBundles((prev) =>
      prev.map((b) => (b.id === bundleId ? { ...b, isActive: !b.isActive } : b))
    );
  };

  return (
    <Page
      title="Discount Manager"
      primaryAction={{
        content: "Create Bundle",
        onAction: () => setShowCreateModal(true),
      }}
    >
      <Layout>
        <Layout.Section oneHalf>
          <Card title="Bundle Statistics" sectioned>
            <InlineStack align="space-evenly">
              <BlockStack align="space-around">
                <Text tone="subdued">Total Bundles</Text>
                <h2>{bundles.length}</h2>
              </BlockStack>
              <BlockStack align="space-around">
                <Text tone="subdued">Active Bundles</Text>
                <h2>{bundles.filter((b) => b.isActive).length}</h2>
              </BlockStack>
            </InlineStack>
          </Card>
        </Layout.Section>

        <Layout.Section oneHalf>
          <Card title="Quick Actions" sectioned>
            <BlockStack align="space-evenly" gap="100">
              <Button
                variant="primary"
                fullWidth
                onClick={() => setShowCreateModal(true)}
              >
                Create New Bundle
              </Button>
              <Link to="/">
                <Button
                  fullWidth
                  onClick={() => setLoading(true)}
                  loading={loading}
                >
                  Homepage
                </Button>
              </Link>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card title="Existing Bundles">
            {bundles.length === 0 ? (
              <EmptyState
                h2="No bundles created yet"
                action={{
                  content: "Create Bundle",
                  onAction: () => setShowCreateModal(true),
                }}
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>
                  Create your first product bundle to start offering discounts
                  to your customers.
                </p>
              </EmptyState>
            ) : (
              <ResourceList
                items={bundles}
                renderItem={(bundle) => (
                  <ResourceItem id={bundle.id} name={bundle.name}>
                    <BlockStack
                      gap="400"
                      inlineAlign="start"
                      align="space-around"
                    >
                      <BlockStack
                        gap="100"
                        inlineAlign="start"
                        align="space-around"
                      >
                        <BlockStack alignment="center" spacing="tight">
                          <h2 size="small">{bundle.name}</h2>
                          <Badge
                            tone={bundle.isActive ? "success" : "attention"}
                          >
                            {bundle.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </BlockStack>
                        <Text tone="subdued">{bundle.products.join(", ")}</Text>
                        <BlockStack>
                          <Text tone="subdued">
                            {bundle.discountType === "percentage"
                              ? `${bundle.discountValue}% off`
                              : `$${bundle.discountValue} off`}
                          </Text>
                          <Text tone="subdued">
                            Total Value: Tk {bundle.totalValue.toFixed(2)}
                          </Text>
                        </BlockStack>
                      </BlockStack>
                      <ButtonGroup>
                        <Button
                          size="slim"
                          onClick={() => toggleBundleStatus(bundle.id)}
                        >
                          {bundle.isActive ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          size="slim"
                          variant="primary"
                          onClick={() => handleEditBundle(bundle)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="slim"
                          variant="primary"
                          tone="critical"
                          onClick={() => handleDeleteBundle(bundle.id)}
                        >
                          Delete
                        </Button>
                      </ButtonGroup>
                    </BlockStack>
                  </ResourceItem>
                )}
              />
            )}
          </Card>
        </Layout.Section>
      </Layout>

      <Modal
        open={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title={editingBundle ? "Edit Bundle" : "Create New Bundle"}
        primaryAction={{
          content: editingBundle ? "Update Bundle" : "Create Bundle",
          onAction: handleSaveBundle,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => {
              setShowCreateModal(false);
              resetForm();
            },
          },
        ]}
      >
        <Modal.Section>
          <BlockStack gap="400">
            <TextField
              label="Bundle Name"
              value={bundleName}
              onChange={setBundleName}
              placeholder="Enter bundle name"
              requiredIndicator
            />

            <BlockStack>
              <Text as="h2" variant="headingSm">
                Select Products (minimum 2)
              </Text>
              <Card sectioned>
                <BlockStack>
                  {products.map((product) => (
                    <BlockStack key={product.id} align="center">
                      <Checkbox
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleProductSelection(product.id)}
                      />
                      <Avatar source={product.image} size="lg" />
                      <BlockStack>
                        <Text>{product.title}</Text>
                        <Text tone="subdued">${product.price}</Text>
                      </BlockStack>
                    </BlockStack>
                  ))}
                </BlockStack>
              </Card>
            </BlockStack>

            <BlockStack>
              <Text as="h2" variant="headingSm">
                Discount Configuration
              </Text>
              <BlockStack>
                <RadioButton
                  label="Percentage Discount"
                  checked={discountType === "percentage"}
                  onChange={() => setDiscountType("percentage")}
                />
                <RadioButton
                  label="Fixed Amount Discount"
                  checked={discountType === "fixed"}
                  onChange={() => setDiscountType("fixed")}
                />
              </BlockStack>
              <TextField
                label={
                  discountType === "percentage"
                    ? "Discount Percentage"
                    : "Discount Amount"
                }
                value={discountValue}
                onChange={setDiscountValue}
                type="number"
                prefix={discountType === "percentage" ? "" : "Tk"}
                suffix={discountType === "percentage" ? "%" : ""}
                placeholder={discountType === "percentage" ? "10" : "50"}
                requiredIndicator
              />
            </BlockStack>

            {selectedProducts.length > 0 && discountValue && (
              <Card sectioned>
                <BlockStack gap="100">
                  <Text as="h2" variant="headingSm">
                    Price Summary
                  </Text>
                  <BlockStack align="space-evenly">
                    <Text>Original Price:</Text>
                    <Text>Tk {calculateTotalPrice().toFixed(2)}</Text>
                  </BlockStack>
                  <BlockStack align="space-evenly">
                    <Text>Discounted Price:</Text>
                    <Text tone="strong">
                      Tk {calculateDiscountedPrice().toFixed(2)}
                    </Text>
                  </BlockStack>
                  <BlockStack align="space-evenly">
                    <Text>You Save:</Text>
                    <Text tone="positive">
                      Tk{" "}
                      {(
                        calculateTotalPrice() - calculateDiscountedPrice()
                      ).toFixed(2)}
                    </Text>
                  </BlockStack>
                </BlockStack>
              </Card>
            )}
          </BlockStack>
        </Modal.Section>
      </Modal>

      {loading && <Loading />}
    </Page>
  );
};

export default Discount;
