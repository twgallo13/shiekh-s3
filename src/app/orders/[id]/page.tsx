"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { useRole } from "@/components/providers/RoleProvider";
import { useToast } from "@/components/ui/ToastHost";
import VendorSplit from "./VendorSplit";
import { type OrderLine } from "@/lib/orders/vendorSplit";

interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  status: string;
  urgency: string;
  total: number;
  currency: string;
  items: OrderLine[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Order Detail Page
 * Shows order information with Vendor Split functionality (dev-only)
 */
export default function OrderDetailPage() {
  const params = useParams();
  const { effectiveRole } = useRole();
  const toast = useToast();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showVendorSplit, setShowVendorSplit] = useState(false);

  const orderId = params.id as string;

  // Check if user can access vendor split
  const canAccessVendorSplit = ['FM', 'ADMIN'].includes(effectiveRole);

  // Load order data
  useEffect(() => {
    const loadOrder = async () => {
      setLoading(true);
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock order data
        const mockOrder: Order = {
          id: orderId,
          orderNumber: `ORD-${orderId.padStart(6, '0')}`,
          customerId: 'CUST-123',
          customerName: 'Acme Corporation',
          status: 'PENDING',
          urgency: 'HIGH',
          total: 1250.00,
          currency: 'USD',
          items: [
            {
              sku: 'SKU-ELEC-001',
              qty: 5,
              unitCost: 150.00,
              description: 'High-performance processor'
            },
            {
              sku: 'SKU-ELEC-002',
              qty: 3,
              unitCost: 200.00,
              description: 'Memory module 16GB'
            },
            {
              sku: 'SKU-COMP-001',
              qty: 2,
              unitCost: 100.00,
              description: 'Storage drive 1TB'
            }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        setOrder(mockOrder);
      } catch (error) {
        toast({
          kind: 'error',
          text: 'Failed to load order details'
        });
        console.error('Order load error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      loadOrder();
    }
  }, [orderId, toast]);

  const handleVendorSplit = () => {
    if (process.env.NODE_ENV !== 'development') {
      toast({
        kind: 'info',
        text: 'Vendor Split is not available yet'
      });
      return;
    }
    
    setShowVendorSplit(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Order Not Found</h1>
          <p className="text-gray-600">The requested order could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
          <p className="text-gray-600">Order {order.orderNumber}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={getStatusColor(order.status)}>
            {order.status}
          </Badge>
          <Badge className={getUrgencyColor(order.urgency)}>
            {order.urgency}
          </Badge>
        </div>
      </div>

      {/* Order Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Customer Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Customer ID:</span>
                <span className="ml-2">{order.customerId}</span>
              </div>
              <div>
                <span className="font-medium">Customer Name:</span>
                <span className="ml-2">{order.customerName}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Total Amount:</span>
                <span className="ml-2">{order.currency} ${order.total.toFixed(2)}</span>
              </div>
              <div>
                <span className="font-medium">Items:</span>
                <span className="ml-2">{order.items.length}</span>
              </div>
              <div>
                <span className="font-medium">Total Quantity:</span>
                <span className="ml-2">{order.items.reduce((sum, item) => sum + item.qty, 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timestamps */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Timestamps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Created:</span>
                <span className="ml-2 text-sm">{new Date(order.createdAt).toLocaleString()}</span>
              </div>
              <div>
                <span className="font-medium">Updated:</span>
                <span className="ml-2 text-sm">{new Date(order.updatedAt).toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">SKU</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Quantity</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Unit Cost</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Total Cost</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 px-4 py-2 font-mono">{item.sku}</td>
                    <td className="border border-gray-300 px-4 py-2">{item.description}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{item.qty}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      {item.unitCost ? `$${item.unitCost.toFixed(2)}` : '-'}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      {item.unitCost ? `$${(item.unitCost * item.qty).toFixed(2)}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {process.env.NODE_ENV !== 'development' && (
            <span>Vendor Split is not available in production</span>
          )}
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => window.history.back()}>
            Back
          </Button>
          
          {canAccessVendorSplit && (
            <Button
              onClick={handleVendorSplit}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Vendor Split
            </Button>
          )}
        </div>
      </div>

      {/* Vendor Split Modal */}
      {showVendorSplit && (
        <VendorSplit
          isOpen={showVendorSplit}
          onClose={() => setShowVendorSplit(false)}
          orderId={order.id}
          orderLines={order.items}
        />
      )}
    </div>
  );
}
