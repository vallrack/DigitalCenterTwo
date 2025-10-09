// /src/app/finance/accounting-client.tsx
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import type { Account, JournalEntry } from '@/lib/types';
import { getAccounts, getJournalEntries, deleteAccount } from '@/services/accounting-service';
import { JournalEntryForm } from './journal-entry-form';
import { AccountForm } from './account-form';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export function AccountingClient() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isJournalFormOpen, setIsJournalFormOpen] = useState(false);
  const [isAccountFormOpen, setIsAccountFormOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [accountsData, entriesData] = await Promise.all([
        getAccounts(),
        getJournalEntries(),
      ]);
      setAccounts(accountsData);
      setJournalEntries(entriesData);
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudieron cargar los datos contables.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFormSuccess = () => {
    setIsJournalFormOpen(false);
    setIsAccountFormOpen(false);
    fetchData();
  };
  
  const handleEditAccount = (account: Account) => {
    setSelectedAccount(account);
    setIsAccountFormOpen(true);
  }

  const handleAddNewAccount = () => {
    setSelectedAccount(null);
    setIsAccountFormOpen(true);
  }
  
  const openDeleteDialog = (account: Account) => {
    setAccountToDelete(account);
    setIsDeleteDialogOpen(true);
  }

  const handleDeleteConfirm = async () => {
    if (!accountToDelete) return;
    try {
      await deleteAccount(accountToDelete.id);
      toast({ title: 'Éxito', description: 'Cuenta contable eliminada.' });
      fetchData();
    } catch (error) {
       toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
    } finally {
      setIsDeleteDialogOpen(false);
      setAccountToDelete(null);
    }
  }

  const getAccountName = (id: string) => accounts.find(a => a.id === id)?.name || 'Cuenta no encontrada';

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Módulo de Contabilidad</CardTitle>
          <CardDescription>
            Gestione su plan de cuentas (PUC) y registre los movimientos contables (asientos).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="chartOfAccounts">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
              <TabsList>
                <TabsTrigger value="chartOfAccounts">Plan de Cuentas (PUC)</TabsTrigger>
                <TabsTrigger value="journalEntries">Asientos Contables</TabsTrigger>
              </TabsList>
              <div className="flex gap-2">
                <Button onClick={() => handleAddNewAccount()}>
                    <PlusCircle className="mr-2 h-4 w-4"/>
                    Crear Cuenta
                </Button>
                <Button onClick={() => setIsJournalFormOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4"/>
                  Registrar Asiento
                </Button>
              </div>
            </div>
            <TabsContent value="chartOfAccounts">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nombre de la Cuenta</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={5} className="text-center">Cargando...</TableCell></TableRow>
                  ) : (
                    accounts.map(account => (
                      <TableRow key={account.id} className={account.isParent ? 'bg-muted/50' : ''}>
                        <TableCell className={account.isParent ? 'font-bold' : 'pl-8'}>{account.code}</TableCell>
                        <TableCell className={account.isParent ? 'font-bold' : ''}>{account.name}</TableCell>
                        <TableCell>{account.type}</TableCell>
                        <TableCell className="text-right font-mono">${account.balance.toLocaleString('es-CO')}</TableCell>
                        <TableCell className="text-right">
                           {!account.isParent && (
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button size="icon" variant="ghost"><MoreHorizontal /></Button></DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem onClick={() => handleEditAccount(account)}>Editar</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => openDeleteDialog(account)} className="text-red-600">Eliminar</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                           )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="journalEntries">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Cuenta</TableHead>
                    <TableHead className="text-right">Débito</TableHead>
                    <TableHead className="text-right">Crédito</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                   {loading ? (
                    <TableRow><TableCell colSpan={5} className="text-center">Cargando...</TableCell></TableRow>
                  ) : journalEntries.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center">No hay asientos registrados.</TableCell></TableRow>
                  ) : (
                    journalEntries.map(entry => (
                       <React.Fragment key={entry.id}>
                        <TableRow className="bg-muted/20">
                          <TableCell className="font-bold">{entry.date}</TableCell>
                          <TableCell colSpan={4} className="font-semibold italic">{entry.description}</TableCell>
                        </TableRow>
                         {entry.transactions.map((t, index) => (
                           <TableRow key={index}>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell>{t.accountCode} - {getAccountName(t.accountId)}</TableCell>
                            <TableCell className="text-right font-mono">${t.debit > 0 ? t.debit.toLocaleString('es-CO') : ''}</TableCell>
                            <TableCell className="text-right font-mono">${t.credit > 0 ? t.credit.toLocaleString('es-CO') : ''}</TableCell>
                           </TableRow>
                         ))}
                       </React.Fragment>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Dialog open={isJournalFormOpen} onOpenChange={setIsJournalFormOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader><DialogTitle>Nuevo Asiento Contable</DialogTitle></DialogHeader>
          <JournalEntryForm accounts={accounts} onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>
       <Dialog open={isAccountFormOpen} onOpenChange={setIsAccountFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{selectedAccount ? 'Editar Cuenta' : 'Crear Nueva Cuenta'}</DialogTitle></DialogHeader>
          <AccountForm accounts={accounts} account={selectedAccount} onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la cuenta contable. No se puede deshacer si la cuenta tiene un saldo diferente de cero.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Continuar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
